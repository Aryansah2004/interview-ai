import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe, verifyIdentity, resetPassword } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
        } catch (err) {
            setUser(null)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        } catch (err) {
            setUser(null)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyIdentity = async ({ email, username }) => {
        setLoading(true)
        try {
            const data = await verifyIdentity({ email, username })
            return data
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async ({ email, username, newPassword, confirmPassword }) => {
        setLoading(true)
        try {
            const data = await resetPassword({ email, username, newPassword, confirmPassword })
            return data
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const authPaths = ['/login', '/register', '/forgot-password']
        if (authPaths.includes(window.location.pathname)) {
            setLoading(false)
            return
        }

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout, handleVerifyIdentity, handleResetPassword }

}

