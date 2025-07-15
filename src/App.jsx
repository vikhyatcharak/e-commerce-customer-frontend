import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Layout from './components/layout/Layout.jsx'
import Homepage from './pages/Homepage.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
                </CartProvider>
            </AuthProvider>
        </Router>
    )
}
function AppRoutes() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    }
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
                <Route path="order-confirmation" element={"<OrderConfirmation />"} />
                <Route path="profile" element={"<Profile />"} />
                <Route path="orders" element={"<Orders />"} />
                <Route path="addresses" element={"<Addresses />"} />
                <Route path="contact" element={"<Contact />"} />
                <Route path="support" element={"<Support />"} />
            </Route>
        </Routes>
    )
}
export default App
