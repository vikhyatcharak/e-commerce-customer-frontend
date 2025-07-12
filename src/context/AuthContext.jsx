import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/customer.js'
import { toast } from 'react-toastify'
import CustomerApi from '../api/axios.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('customerToken')
        if (token) {
            try {
                const response = await authAPI.getCurrentCustomer()
                if (response.data.success) {
                    setCustomer(response.data.data)
                    setIsAuthenticated(true)
                }
            } catch (error) {
                console.error("Auth check failed", error)
                localStorage.removeItem('customerToken')
                setCustomer(null)
                setIsAuthenticated(false)
            } finally {
                setLoading(false)
            }
        }
    }

    // Auto token refresh every 10 hours

    useEffect(() => {
        if (!customer || !isAuthenticated) return

        const checkTokenExpiry = async () => {
            try {
                const response = await CustomerApi.getCurrentCustomer()
                if (!response.data.success) {
                    await refreshToken()
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    await refreshToken()
                }
            }
        }
        const interval = setInterval(checkTokenExpiry, 10 * 60 * 60 * 1000) // 5 hours
        return () => clearInterval(interval)
    }, [customer, isAuthenticated])

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials)
            if (response.data?.success) {
                localStorage.setItem('customerToken', response.data.data.accessToken)
                setIsAuthenticated(true)
                setCustomer(response.data.data.user)
                toast.success('Login successful!')
            }
            return { success: true, data: response.data.data }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Login failed')
            return { success: false, error: error.response?.data?.message }
        }
    }

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData)
            if (response.data.success) {
                setCustomer(response.data.data.user)
                setIsAuthenticated(true)
                toast.success('Registration successful!')
                return { success: true, data: response.data.data }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
            return { success: false, error: error.response?.data?.message }
        }
    }

    const loginWithOtp = async (phone, otp, name, email) => {
        try {
            const response = await authAPI.verifyOtp({ phone, otp, name, email })
            if (response.data.success) {
                setCustomer(response.data.data.user)
                setIsAuthenticated(true)
                toast.success('Login successful!')
                return { success: true, data: response.data.data }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP verification failed')
            return { success: false, error: error.response?.data?.message }
        }
    }

    const sendOtp = async (phone) => {
        try {
            const response = await authAPI.sendOtp({ phone })
            if (response.data.success) {
                toast.success('OTP sent successfully!')
                return { success: true }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP')
            return { success: false, error: error.response?.data?.message }
        }
    }

    const logout = async () => {
        try {
            await authAPI.logout()
            setCustomer(null)
            setIsAuthenticated(false)
            toast.success('Logged out successfully!')
        } catch (error) {
            console.error('Logout error:', error)
            // Even if API call fails, clear local state
            setCustomer(null)
            localStorage.removeItem('customerToken')
            setIsAuthenticated(false)
        }
    }

    const updateProfile = async (data) => {
        try {
            const response = await authAPI.updateProfile(data)
            if (response.data?.success) {
                setCustomer(response.data.data)
                toast.success('Profile updated successfully!')
                return { success: true }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Profile update failed')
            return { success: false, error: error.response?.data?.message }
        }
    }

    const value = {
        customer,
        loading,
        isAuthenticated,
        login,
        register,
        loginWithOtp,
        sendOtp,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}