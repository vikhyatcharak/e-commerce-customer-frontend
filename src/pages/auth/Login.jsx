import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'

const Login = () => {
    const { login, sendOtp, loginWithOtp } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [loginType, setLoginType] = useState('email') 
    const [otpSent, setOtpSent] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        otp: '',
        name: ''
    })
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({...prev,[name]: value}))
        if (errors[name]) {
            setErrors(prev => ({...prev,[name]: ''}))
        }
    }

    const validateEmailLogin = () => {
        const newErrors = {}

        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

        if (!formData.password) newErrors.password = 'Password is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validatePhoneOtp = () => {
        const newErrors = {}

        if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
        else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits'

        if (otpSent && !formData.otp.trim()) newErrors.otp = 'OTP is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleEmailLogin = async (e) => {
        e.preventDefault()

        if (!validateEmailLogin()) return

        setLoading(true)
        const result = await login({
            email: formData.email,
            password: formData.password
        })

        setLoading(false)

        if (result.success) {
            navigate('/')
        }
    }

    const handleSendOtp = async (e) => {
        e.preventDefault()

        if (!validatePhoneOtp()) return

        setLoading(true)
        const result = await sendOtp(formData.phone)
        setLoading(false)

        if (result.success) {
            setOtpSent(true)
        }
    }

    const handleOtpLogin = async (e) => {
        e.preventDefault()

        if (!validatePhoneOtp()) return

        setLoading(true)
        const result = await loginWithOtp(
            formData.phone,
            formData.otp,
            formData.name,
            formData.email
        )

        setLoading(false)

        if (result.success) {
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/customer/register" className="font-medium text-blue-600 hover:text-blue-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                {/* Login Type Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => {
                            setLoginType('email')
                            setOtpSent(false)
                            setErrors({})
                        }}
                        className={`flex-1 py-2 px-4 rounded-md transition-colors ${loginType === 'email'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Registered{'(Email/Password)'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setLoginType('otp')
                            setOtpSent(false)
                            setErrors({})
                        }}
                        className={`flex-1 py-2 px-4 rounded-md transition-colors ${loginType === 'otp'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Guest{'(Phone/OTP)'}
                    </button>
                </div>

                {/* Email/Password Login */}
                {loginType === 'email' && (
                    <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
                        <div className="space-y-4">
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={errors.email}
                                required
                            />

                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                error={errors.password}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                            size="lg"
                        >
                            Sign In
                        </Button>
                    </form>
                )}

                {/* Phone/OTP Login */}
                {loginType === 'otp' && (
                    <form className="mt-8 space-y-6" onSubmit={otpSent ? handleOtpLogin : handleSendOtp}>
                        <div className="space-y-4">
                            <Input
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                error={errors.phone}
                                placeholder="10-digit phone number"
                                disabled={otpSent}
                                required
                            />

                            {otpSent && (
                                <>
                                    <Input
                                        label="Enter OTP"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        error={errors.otp}
                                        placeholder="6-digit OTP"
                                        required
                                    />

                                    <Input
                                        label="Name (for new users)"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your full name"
                                    />

                                    <Input
                                        label="Email (optional)"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your@email.com"
                                    />
                                </>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full"
                                size="lg"
                            >
                                {otpSent ? 'Verify OTP & Sign In' : 'Send OTP'}
                            </Button>

                            {otpSent && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOtpSent(false)
                                        setFormData(prev => ({ ...prev, otp: '', name: '', email: '' }))
                                    }}
                                    className="w-full"
                                    size="lg"
                                >
                                    Change Phone Number
                                </Button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Login
