import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Briefcase, User, UploadCloud, Sparkles, Info, LogOut, FileText, Loader2, X, TrendingUp } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useInterview } from '../hooks/useInterview'
import "../style/home.scss"

const MAX_JOB_DESC_LENGTH = 5000

const Home = () => {
  const { handleLogout } = useAuth()
  const { loading, error, handleGenerateReport } = useInterview()
  const navigate = useNavigate()

  const [jobDescription, setJobDescription] = useState("")
  const [resume, setResume] = useState(null)
  const [selfDescription, setSelfDescription] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const onLogout = async () => {
    await handleLogout()
    navigate('/login')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setResume(file || null)
  }

  const handleRemoveFile = () => {
    setResume(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      setResume(file)
    }
  }

  const isFormValid =
    jobDescription.trim().length > 0 &&
    Boolean(resume) &&
    selfDescription.trim().length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid || loading) return

    try {
      const report = await handleGenerateReport({ jobDescription, resume, selfDescription })
      navigate(`/interview/${report._id}`)
    } catch (err) {
      // error is already captured in the hook's `error` state and shown below
    }
  }

  return (
    <main className='home'>

      <div className="home-toolbar">
        <button className="progress-btn" onClick={() => navigate('/progress')}>
          <TrendingUp size={15} />
          My Progress
        </button>

        <div className="home-toolbar__right">
          <button className="history-btn" onClick={() => navigate('/reports')}>
            <FileText size={15} />
            My Reports
          </button>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      <header className="home-header">
        <h1>
          Create Your Custom <span className="highlight-text">Interview Plan</span>
        </h1>
        <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
      </header>

      <form className="interview-card" onSubmit={handleSubmit}>

        {error && <p className="form-error">{error}</p>}

        <div className="interview-input-group">

          <div className="left">
            <div className="panel-header">
              <span className="panel-title">
                <Briefcase size={16} />
                Target Job Description
              </span>
              <span className="badge badge--required">Required</span>
            </div>

            <textarea
              name="jobDescription"
              id="jobDescription"
              maxLength={MAX_JOB_DESC_LENGTH}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
              disabled={loading}
            />

            <span className="char-count">{jobDescription.length} / {MAX_JOB_DESC_LENGTH} chars</span>
          </div>

          <div className="right">
            <div className="panel-header">
              <span className="panel-title">
                <User size={16} />
                Your Profile
              </span>
            </div>

            <div className="input-group">
              <label htmlFor="resume" className="field-label">
                Upload Resume
                <span className="badge badge--required">Required</span>
              </label>

              <div className="dropzone-wrapper">
                <label
                  className={`dropzone ${isDragging ? "dropzone--dragging" : ""}`}
                  htmlFor="resume"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {resume ? (
                    <>
                      <span className="dropzone__icon">
                        <FileText size={20} />
                      </span>
                      <span className="dropzone__title">{resume.name}</span>
                      <span className="dropzone__hint">Click to replace file</span>
                    </>
                  ) : (
                    <>
                      <span className="dropzone__icon">
                        <UploadCloud size={20} />
                      </span>
                      <span className="dropzone__title">Click to upload or drag &amp; drop</span>
                      <span className="dropzone__hint">PDF only (Max 5MB)</span>
                    </>
                  )}
                </label>
                <input
                  hidden
                  type="file"
                  name="resume"
                  id="resume"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {resume && (
                  <button
                    type="button"
                    className="dropzone-remove"
                    onClick={handleRemoveFile}
                    disabled={loading}
                    aria-label="Remove uploaded file"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="selfDescription" className="field-label">
                Self Description
                <span className="badge badge--required">Required</span>
              </label>
              <textarea
                name="selfDescription"
                id="selfDescription"
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                placeholder="Describe your experience, key skills, and years of experience..."
                disabled={loading}
              />
            </div>

            <div className="notice">
              <Info size={16} />
              <p><strong>Resume</strong>, <strong>Self Description</strong>, and <strong>Job Description</strong> are all required to generate a personalized plan.</p>
            </div>
          </div>

        </div>

        <div className="interview-footer">
          <span className="footer-note">AI-Powered Strategy Generation &bull; Approx 30s</span>
          <button type="submit" className="button primary-button" disabled={!isFormValid || loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate My Interview Strategy
              </>
            )}
          </button>
        </div>
      </form>

      <footer className="home-footer">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Help Center</a>
      </footer>

    </main>
  )
}

export default Home

