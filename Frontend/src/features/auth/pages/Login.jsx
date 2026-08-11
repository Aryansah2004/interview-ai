import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'


const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email.trim() || !password.trim()) {
            setError("Please enter email address and password.")
            return
        }

        try {
            await handleLogin({ email, password })
            navigate('/')
        } catch (err) {
            setError(err?.response?.data?.message || "Please enter a valid email address and password.")
        }
    }

    if (loading) {
        return (
            <main className="auth-page">
                <p className="auth-loading">Loading...</p>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <p className="eyebrow">Welcome back</p>
                    <h1>Log in to <span className="highlight-text">your account</span></h1>
                    <p className="subtitle">Pick up where you left off with your interview prep.</p>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name="email" placeholder="Enter your email address"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                                type={showPassword ? "text" : "password"}
                                id="password" name="password" placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                    </div>

                    <button className="button primary-button" type="submit">Login</button>
                </form>

                <p className="auth-switch">Don't have an account? <Link to={"/register"}>Register</Link></p>
            </div>

           <footer className="auth-footer">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </footer>
        </main>
    )
}

export default Login

