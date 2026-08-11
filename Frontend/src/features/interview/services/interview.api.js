import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function generateInterviewReport({ jobDescription, resume, selfDescription }) {
    try {
        const formData = new FormData()
        formData.append("jobDescription", jobDescription)
        formData.append("selfDescription", selfDescription)

        if (resume) {
            formData.append("resume", resume)
        }

        const response = await api.post('/api/interview/', formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })

        return response.data

    } catch (err) {
        throw err
    }
}

export async function getInterviewReportById(interviewId) {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)
        return response.data
    } catch (err) {
        throw err
    }
}

export async function getAllInterviewReports() {
    try {
        const response = await api.get('/api/interview/')
        return response.data
    } catch (err) {
        throw err
    }
}

export async function downloadResumePdf(interviewId) {
    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewId}`, null, {
            responseType: 'blob'
        })
        return response.data
    } catch (err) {
        throw err
    }
}
