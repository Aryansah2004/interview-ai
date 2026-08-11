import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, FileText, ChevronRight, Inbox } from 'lucide-react'
import { useInterview } from '../hooks/useInterview'
import "../style/reports.scss"

const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const Reports = () => {
    const navigate = useNavigate()
    const { loading, error, handleGetAllReports } = useInterview()
    const [reports, setReports] = useState([])

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await handleGetAllReports()
                setReports(data)
            } catch (err) {
                // error is already captured in the hook's `error` state and shown below
            }
        }
        fetchReports()
    }, [])

    return (
        <main className="reports-page">
            <div className="reports-page__inner">

                <button className="back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={15} />
                    Back to Home
                </button>

                <header className="reports-header">
                    <h1>Your <span className="highlight-text">Interview Reports</span></h1>
                    <p>All the strategies you've generated so far.</p>
                </header>

                {loading && (
                    <p className="reports-status">Loading your reports...</p>
                )}

                {!loading && error && (
                    <p className="reports-status reports-status--error">{error}</p>
                )}

                {!loading && !error && reports.length === 0 && (
                    <div className="reports-empty">
                        <Inbox size={28} />
                        <p>You haven't generated any reports yet.</p>
                        <button className="button primary-button" onClick={() => navigate('/')}>
                            Generate your first report
                        </button>
                    </div>
                )}

                {!loading && !error && reports.length > 0 && (
                    <div className="reports-list">
                        {reports.map((report) => (
                            <button
                                key={report._id}
                                className="report-row"
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >
                                <span className="report-row__icon">
                                    <FileText size={16} />
                                </span>

                                <span className="report-row__body">
                                    <span className="report-row__title">{report.title}</span>
                                    <span className="report-row__date">{formatDate(report.createdAt)}</span>
                                </span>

                                <span className="report-row__score">{report.matchScore}% match</span>

                                <ChevronRight size={16} className="report-row__chevron" />
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </main>
    )
}

export default Reports
