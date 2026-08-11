import { useState } from "react"
import { generateInterviewReport, getInterviewReportById, getAllInterviewReports, downloadResumePdf } from "../services/interview.api"

export const useInterview = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleGenerateReport = async ({ jobDescription, resume, selfDescription }) => {
        setLoading(true)
        setError("")
        try {
            const data = await generateInterviewReport({ jobDescription, resume, selfDescription })
            return data.interviewReport
        } catch (err) {
            const message = err?.response?.data?.message || "Something went wrong while generating your report. Please try again."
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleGetReportById = async (interviewId) => {
        setLoading(true)
        setError("")
        try {
            const data = await getInterviewReportById(interviewId)
            return data.interviewReport
        } catch (err) {
            const message = err?.response?.data?.message || "Couldn't load this report."
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleGetAllReports = async () => {
        setLoading(true)
        setError("")
        try {
            const data = await getAllInterviewReports()
            return data.interviewReports
        } catch (err) {
            const message = err?.response?.data?.message || "Couldn't load your reports."
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadResumePdf = async (interviewId) => {
        setLoading(true)
        setError("")
        try {
            const blob = await downloadResumePdf(interviewId)
            return blob
        } catch (err) {
            let message = "Couldn't generate the resume PDF. Please try again."
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text()
                    const parsed = JSON.parse(text)
                    message = parsed.message || message
                } catch (parseErr) {
                    // fall back to default message
                }
            }
            setError(message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { loading, error, handleGenerateReport, handleGetReportById, handleGetAllReports, handleDownloadResumePdf }
}
