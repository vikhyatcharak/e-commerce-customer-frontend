import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
    return (
        <>
            <Router>
                <AuthProvider>
                    <CartProvider>
                        <AppRoutes />
                    </CartProvider>
                </AuthProvider>
            </Router>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="colored"
            />
        </>
    )
}
function AppRoutes() {
    const { isAuthenticated } = useAuth()

    return (
        <Routes>
            {/* Public Routes */}
            {isAuthenticated
                ? <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />
                : <Route path="/" element={<Navigate to="/customer/login" replace />} />
            }
            <Route path="/customer/login" element={<Login />} />
            <Route path="/customer/register" element={<Register />} />
        </Routes>
    )
}
export default App
