import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, TrendingUp, Award, FileBarChart } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useInterview } from '../hooks/useInterview'
import "../style/progress.scss"

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const point = payload[0].payload
    return (
        <div className="chart-tooltip">
            <span className="chart-tooltip__title">{point.title}</span>
            <span className="chart-tooltip__score">{point.matchScore}% match</span>
            <span className="chart-tooltip__date">{point.fullDate}</span>
        </div>
    )
}

const CustomDot = (props) => {
    const { cx, cy } = props
    return <circle cx={cx} cy={cy} r={4} fill="#ff2d78" stroke="#131319" strokeWidth={2} />
}

const Progress = () => {
    const navigate = useNavigate()
    const { loading, error, handleGetAllReports } = useInterview()
    const [reports, setReports] = useState([])

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await handleGetAllReports()
                setReports(data)
            } catch (err) {
                // error already captured in hook state
            }
        }
        fetchReports()
    }, [])

    const chartData = useMemo(() => {
        return [...reports]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((r, index) => ({
                index,
                fullDate: new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
                shortDate: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                matchScore: r.matchScore,
                title: r.title
            }))
    }, [reports])

    const stats = useMemo(() => {
        if (reports.length === 0) return { total: 0, average: 0, best: 0 }
        const total = reports.length
        const average = Math.round(reports.reduce((sum, r) => sum + r.matchScore, 0) / total)
        const best = Math.max(...reports.map((r) => r.matchScore))
        return { total, average, best }
    }, [reports])

    const skillGapStats = useMemo(() => {
        const counts = {}
        reports.forEach((r) => {
            (r.skillGaps || []).forEach((gap) => {
                counts[gap.skill] = (counts[gap.skill] || 0) + 1
            })
        })
        const total = reports.length || 1
        return Object.entries(counts)
            .map(([skill, count]) => ({
                skill,
                count,
                percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
    }, [reports])

    return (
        <main className="progress-page">
            <div className="progress-page__inner">

                <button className="back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={15} />
                    Back to Home
                </button>

                <header className="progress-header">
                    <h1>Your <span className="highlight-text">Progress</span></h1>
                    <p>See how your interview readiness has changed across every report.</p>
                </header>

                {loading && <p className="progress-status">Loading your progress...</p>}
                {!loading && error && <p className="progress-status progress-status--error">{error}</p>}

                {!loading && !error && reports.length === 0 && (
                    <div className="progress-empty">
                        <FileBarChart size={28} />
                        <p>Generate at least one report to see your progress here.</p>
                        <button className="button primary-button" onClick={() => navigate('/')}>
                            Generate your first report
                        </button>
                    </div>
                )}

                {!loading && !error && reports.length > 0 && (
                    <>
                        <div className="stat-grid">
                            <div className="stat-card">
                                <span className="stat-label">
                                    <FileBarChart size={14} /> Reports generated
                                </span>
                                <span className="stat-value">{stats.total}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">
                                    <TrendingUp size={14} /> Average match score
                                </span>
                                <span className="stat-value stat-value--accent">{stats.average}%</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">
                                    <Award size={14} /> Best match
                                </span>
                                <span className="stat-value stat-value--best">{stats.best}%</span>
                            </div>
                        </div>

                        <section className="panel">
                            <h2>Match score over time</h2>
                            <div className="chart-wrap">
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#ff2d78" />
                                                <stop offset="100%" stopColor="#9b4dff" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#262631" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="index"
                                            type="number"
                                            domain={[0, chartData.length - 1]}
                                            tickFormatter={(idx) => chartData[idx]?.shortDate || ''}
                                            stroke="#6b6b78"
                                            fontSize={11.5}
                                            tickLine={false}
                                            axisLine={{ stroke: '#262631' }}
                                            minTickGap={30}
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            stroke="#6b6b78"
                                            fontSize={11.5}
                                            tickLine={false}
                                            axisLine={false}
                                            width={50}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#262631', strokeWidth: 1 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="matchScore"
                                            stroke="url(#lineGradient)"
                                            strokeWidth={2.5}
                                            dot={<CustomDot />}
                                            activeDot={{ r: 6, fill: '#ff2d78', stroke: '#131319', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="panel">
                            <h2>Most common skill gaps</h2>
                            <div className="gap-list">
                                {skillGapStats.length === 0 && (
                                    <p className="gap-empty">No recurring skill gaps yet — nice work.</p>
                                )}
                                {skillGapStats.map((gap) => (
                                    <div className="gap-row" key={gap.skill}>
                                        <span className="gap-name">{gap.skill}</span>
                                        <div className="gap-bar-track">
                                            <div className="gap-bar-fill" style={{ width: `${gap.percentage}%` }} />
                                        </div>
                                        <span className="gap-percentage">{gap.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

            </div>
        </main>
    )
}

export default Progress
