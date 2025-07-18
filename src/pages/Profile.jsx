import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { authAPI } from '../api/customer.js'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import { toast } from 'react-toastify'

const Profile = () => {
    const { isAuthenticated, customer, updateProfile, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        gender: ''
    })
    const [profileErrors, setProfileErrors] = useState({})

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordErrors, setPasswordErrors] = useState({})

    function formatDateLocal(dateString) {
        const d = new Date(dateString)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (customer) {
            setProfileData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                dob: customer.dob ? formatDateLocal(customer.dob) : '',
                gender: customer.gender || ''
            })
        }
    }, [isAuthenticated, customer, navigate])

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({ ...prev, [name]: value }))
        if (profileErrors[name]) {
            setProfileErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateProfile = () => {
        const newErrors = {}

        if (!profileData.name.trim()) newErrors.name = 'Name is required'
        if (!profileData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(profileData.email)) newErrors.email = 'Email is invalid'
        if (!profileData.phone.trim()) newErrors.phone = 'Phone is required'
        else if (!/^[0-9]{10}$/.test(profileData.phone)) newErrors.phone = 'Phone must be 10 digits'

        setProfileErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validatePassword = () => {
        const newErrors = {}

        if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required'
        if (!passwordData.newPassword) newErrors.newPassword = 'New password is required'
        else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters'
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setPasswordErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()

        if (!validateProfile()) return

        setLoading(true)
        const result = await updateProfile(profileData)
        setLoading(false)

    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (!confirm("Are sure you want to change your password")) return
        if (!validatePassword()) return

        setLoading(true)
        try {
            const response = await authAPI.changePassword({
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })

            if (response.data.success) {
                toast.success('Password changed successfully!')
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                await logout()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout()
            navigate('/')
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Orders</h3>
                            <p className="text-sm text-gray-600">View your order history</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/orders')}
                        className="w-full"
                    >
                        View Orders
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📍</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Addresses</h3>
                            <p className="text-sm text-gray-600">Manage delivery addresses</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/addresses')}
                        className="w-full"
                    >
                        Manage Addresses
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🚪</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Logout</h3>
                            <p className="text-sm text-gray-600">Sign out of your account</p>
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                        className="w-full"
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* Profile Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Profile Information
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Change Password
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileInputChange}
                                    error={profileErrors.name}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={handleProfileInputChange}
                                    error={profileErrors.email}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Phone Number"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileInputChange}
                                    error={profileErrors.phone}
                                    required
                                />
                                <Input
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    value={profileData.dob}
                                    onChange={handleProfileInputChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={profileData.gender}
                                        onChange={handleProfileInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    className="w-full md:w-auto"
                                >
                                    Update Profile
                                </Button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <Input
                                label="Current Password"
                                name="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordInputChange}
                                error={passwordErrors.currentPassword}
                                required
                            />

                            <Input
                                label="New Password"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordInputChange}
                                error={passwordErrors.newPassword}
                                required
                            />

                            <Input
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordInputChange}
                                error={passwordErrors.confirmPassword}
                                required
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    className="w-full md:w-auto"
                                >
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
