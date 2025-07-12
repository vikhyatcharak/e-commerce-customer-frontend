import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Layout from './components/layout/Layout.jsx'
import Homepage from './pages/Homepage.jsx'

function App() {
    return (
            <Router>
                <AuthProvider>
                    <CartProvider>
                        <AppRoutes />
                    </CartProvider>
                </AuthProvider>
            </Router>
    )
}
function AppRoutes() {
    const { isAuthenticated } = useAuth()

    return (
        <Routes>
            {/* Public Routes */}
            {isAuthenticated
                ? <Route path="/" element={<Navigate to="/homepage" replace />} />
                : <Route path="/" element={<Navigate to="/login" replace />} />
            }
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Layout />}>
                <Route path='homepage' element={<Homepage />} />
                <Route path="cart" element={"<Cart />"} />
                <Route path="payment" element={"<Payment />"} />
                <Route path="profile" element={"<Profile />"} />
                <Route path="order-confirmation" element={"<OrderConfirmation />"} />
            </Route>
        </Routes>
    )
}
export default App
