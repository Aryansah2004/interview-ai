const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    // Guard: make sure a file was actually uploaded
    if (!req.file) {
        return res.status(400).json({
            message: "Resume file is required."
        })
    }

    // Guard: catch genuinely corrupt/invalid PDF files during extraction itself
    let resumeContent
    try {
        resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    } catch (err) {
        console.error("PDF parsing error:", err.message)
        return res.status(422).json({
            message: "This file couldn't be read as a PDF. It may be corrupted or in an unsupported format. Please upload a valid PDF."
        })
    }

    // Guard: reject if text extraction returned little/no usable content
    // (common with scanned PDFs or heavily designed templates like Canva)
    if (!resumeContent.text || resumeContent.text.trim().length < 50) {
        return res.status(422).json({
            message: "We couldn't read any text from this PDF. This often happens with scanned images or resumes built from design templates (like Canva). Please upload a text-based PDF exported directly from a word processor."
        })
    }

    const { selfDescription, jobDescription } = req.body

    // Guard: make sure required text fields are present
    if (!selfDescription || !jobDescription) {
        return res.status(400).json({
            message: "selfDescription and jobDescription are required."
        })
    }

    try {
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })

    } catch (err) {
        console.error("Error generating interview report:", err)

        // Friendlier message when Gemini's free-tier quota is exhausted
        if (err.status === 429 || err.message?.includes("RESOURCE_EXHAUSTED")) {
            return res.status(429).json({
                message: "Our AI service has hit its usage limit for now. Please try again in a few minutes."
            })
        }

        // Friendlier message when Gemini's servers are temporarily overloaded
        if (err.status === 503 || err.message?.includes("UNAVAILABLE")) {
            return res.status(503).json({
                message: "Our AI service is experiencing high demand right now. Please try again in a moment."
            })
        }

        res.status(500).json({
            message: "Something went wrong while generating your interview report. Please try again."
        })
    }

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    try {
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)

    } catch (err) {
        console.error("Error generating resume PDF:", err)

        if (err.status === 429 || err.message?.includes("RESOURCE_EXHAUSTED")) {
            return res.status(429).json({
                message: "Our AI service has hit its usage limit for now. Please try again in a few minutes."
            })
        }

        if (err.status === 503 || err.message?.includes("UNAVAILABLE")) {
            return res.status(503).json({
                message: "Our AI service is experiencing high demand right now. Please try again in a moment."
            })
        }

        res.status(500).json({
            message: "Something went wrong while generating the resume PDF. Please try again."
        })
    }
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }

