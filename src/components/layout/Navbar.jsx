import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Button from '../common/Button.jsx'

const Navbar = () => {
    const { isAuthenticated, customer, logout } = useAuth()
    const { cartCount } = useCart()
    const navigate = useNavigate()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const handleLogout = async () => {
        await logout()
        navigate('/')
        setShowUserMenu(false)
    }

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-blue-600">🛍️ ShopEase</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Products
                        </Link>
                        <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Categories
                        </Link>
                    </div>

                    {/* Right side - Cart and User */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5H19" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    <span>Hi, {customer?.name}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            to="/orders"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            My Orders
                                        </Link>
                                        <Link
                                            to="/addresses"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Addresses
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate('/register')}
                                >
                                    Register
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200">
                <div className="px-4 py-3 space-y-1">
                    <Link to="/" className="block text-gray-700 hover:text-blue-600 py-2">Home</Link>
                    <Link to="/products" className="block text-gray-700 hover:text-blue-600 py-2">Products</Link>
                    <Link to="/categories" className="block text-gray-700 hover:text-blue-600 py-2">Categories</Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
