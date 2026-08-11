import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const { handleVerifyIdentity, handleResetPassword } = useAuth()

    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleVerifySubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email.trim() || !username.trim()) {
            setError("Please provide both email address and username.")
            return
        }

        setSubmitting(true)
        try {
            await handleVerifyIdentity({ email, username })
            setStep(2)
        } catch (err) {
            setError(err?.response?.data?.message || "Please provide a valid email address and username.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleResetSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setError("Please enter and confirm your new password.")
            return
        }

        setSubmitting(true)
        try {
            const data = await handleResetPassword({ email, username, newPassword, confirmPassword })
            setSuccessMessage(data.message)
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <p className="eyebrow">Reset access</p>
                    <h1>Forgot your <span className="highlight-text">password?</span></h1>
                    <p className="subtitle">
                        {step === 1
                            ? "Enter your registered email address and username to verify your identity."
                            : "Enter and confirm your new password."}
                    </p>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {successMessage && <p className="auth-success">{successMessage}</p>}

                {step === 1 && (
                    <form onSubmit={handleVerifySubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email" id="email" name="email" placeholder="Enter your registered email address"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                type="text" id="username" name="username" placeholder="Enter your username"
                            />
                        </div>

                        <button className="button primary-button" type="submit" disabled={submitting}>
                            {submitting ? "Verifying..." : "Verify Identity"}
                        </button>
                    </form>
                )}

                {step === 2 && !successMessage && (
                    <form onSubmit={handleResetSubmit}>
                        <div className="input-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="password-field">
                                <input
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword" name="newPassword" placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowNewPassword((v) => !v)}
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-field">
                                <input
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword" name="confirmPassword" placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button className="button primary-button" type="submit" disabled={submitting}>
                            {submitting ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <p className="auth-switch">Remembered your password? <Link to={"/login"}>Login</Link></p>
            </div>

            <footer className="auth-footer">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </footer>
        </main>
    )
}

export default ForgotPassword
