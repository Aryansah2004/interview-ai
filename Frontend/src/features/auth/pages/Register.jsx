import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!username.trim() || !email.trim() || !password.trim()) {
            setError("Please provide username, email address, and password.")
            return
        }

        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (err) {
            setError(err?.response?.data?.message || "Please provide a valid username, email address, and password.")
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
                    <p className="eyebrow">Get started</p>
                    <h1>Create your <span className="highlight-text">account</span></h1>
                    <p className="subtitle">Start building a personalized interview strategy in minutes.</p>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name="username" placeholder="Enter username"
                        />
                    </div>

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
                    </div>

                    <button className="button primary-button" type="submit">Register</button>
                </form>

                <p className="auth-switch">Already have an account? <Link to={"/login"}>Login</Link></p>
            </div>

            <footer className="auth-footer">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </footer>
        </main>
    )
}

export default Register

