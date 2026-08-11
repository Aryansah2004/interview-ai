import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Code2, MessageCircle, Map, AlertTriangle, CheckCircle2, Loader2, ArrowLeft, Download } from 'lucide-react'
import { useInterview } from '../hooks/useInterview'
import "../style/interview.scss"

const NAV_ITEMS = [
    { key: "technical", label: "Technical Questions", icon: Code2 },
    { key: "behavioral", label: "Behavioral Questions", icon: MessageCircle },
    { key: "roadmap", label: "Road Map", icon: Map },
]

const Interview = () => {
    const { interviewId } = useParams()
    const navigate = useNavigate()
    const { loading, error, handleGetReportById, handleDownloadResumePdf } = useInterview()

    const [report, setReport] = useState(null)
    const [activeTab, setActiveTab] = useState("technical")
    const [downloading, setDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState("")

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await handleGetReportById(interviewId)
                setReport(data)
            } catch (err) {
                // error is already captured in the hook's `error` state and shown below
            }
        }
        fetchReport()
    }, [interviewId])

    const handleDownload = async () => {
        setDownloading(true)
        setDownloadError("")
        try {
            const blob = await handleDownloadResumePdf(interviewId)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `resume_${interviewId}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setDownloadError("Couldn't generate the resume PDF. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <main className="interview-page">
                <div className="interview-status">
                    <Loader2 size={22} className="spin" />
                    <p>Loading your report...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="interview-page">
                <div className="interview-status interview-status--error">
                    <AlertTriangle size={22} />
                    <p>{error}</p>
                    <button className="button primary-button" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            </main>
        )
    }

    if (!report) {
        return null
    }

    return (
        <main className="interview-page">

            <div className="interview-page__inner">

                <div className="top-row">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={15} />
                        Back
                    </button>

                    <button className="download-btn" onClick={handleDownload} disabled={downloading}>
                        {downloading ? (
                            <>
                                <Loader2 size={15} className="spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download size={15} />
                                Download Tailored Resume
                            </>
                        )}
                    </button>
                </div>

                {downloadError && <p className="form-error">{downloadError}</p>}

                <div className="report-card">

                    <aside className="report-sidebar">
                        <div className="sidebar-header">
                            <span className="report-title">{report.title}</span>
                            <span className="match-badge">{report.matchScore}% match</span>
                        </div>

                        <nav className="sidebar-nav">
                            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    className={`sidebar-nav__item ${activeTab === key ? "is-active" : ""}`}
                                    onClick={() => setActiveTab(key)}
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <section className="report-content">

                        {activeTab === "technical" && (
                            <div className="question-list">
                                <h2>Technical Questions</h2>
                                {report.technicalQuestions.map((q, i) => (
                                    <article className="question-card" key={i}>
                                        <p className="question-card__question">{q.question}</p>
                                        <p className="question-card__meta">
                                            <span className="meta-label">Why they ask this</span>
                                            {q.intention}
                                        </p>
                                        <div className="question-card__answer">
                                            <CheckCircle2 size={14} />
                                            <p>{q.answer}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {activeTab === "behavioral" && (
                            <div className="question-list">
                                <h2>Behavioral Questions</h2>
                                {report.behavioralQuestions.map((q, i) => (
                                    <article className="question-card" key={i}>
                                        <p className="question-card__question">{q.question}</p>
                                        <p className="question-card__meta">
                                            <span className="meta-label">Why they ask this</span>
                                            {q.intention}
                                        </p>
                                        <div className="question-card__answer">
                                            <CheckCircle2 size={14} />
                                            <p>{q.answer}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {activeTab === "roadmap" && (
                            <div className="roadmap-list">
                                <h2>Preparation Road Map</h2>
                                {report.preparationPlan.map((day) => (
                                    <article className="roadmap-card" key={day.day}>
                                        <div className="roadmap-card__day">Day {day.day}</div>
                                        <div className="roadmap-card__body">
                                            <p className="roadmap-card__focus">{day.focus}</p>
                                            <ul>
                                                {day.tasks.map((task, i) => (
                                                    <li key={i}>{task}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                    </section>

                    <aside className="report-skills">
                        <div className="skills-header">
                            <AlertTriangle size={16} />
                            Skill Gaps
                        </div>

                        <div className="skill-pills">
                            {report.skillGaps.map((gap, i) => (
                                <span className={`skill-pill skill-pill--${gap.severity}`} key={i}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </aside>

                </div>

            </div>

        </main>
    )
}

export default Interview

