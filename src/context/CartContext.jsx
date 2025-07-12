import React, { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../api/customer.js'
import { useAuth } from './AuthContext.jsx'
import { toast } from 'react-toastify'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [cartCount, setCartCount] = useState(0)
    const [cartSummary, setCartSummary] = useState({
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        total: 0 
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart()
            fetchCartCount()
        } else {
            setCartItems([])
            setCartCount(0)
            setCartSummary({ totalItems: 0, subtotal: 0, tax: 0, total: 0 })
        }
    }, [isAuthenticated])

    const fetchCart = async () => {
        try {
            setLoading(true)
            const response = await cartAPI.getCart()
            if (response.data.success) {
                setCartItems(response.data.data.items || [])
                setCartSummary(response.data.data.summary || {})
            }
        } catch (error) {
            console.error('Error fetching cart:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCartCount = async () => {
        try {
            const response = await cartAPI.getCartCount()
            if (response.data.success) {
                setCartCount(response.data.data.itemCount || 0)
            }
        } catch (error) {
            console.error('Error fetching cart count:', error)
        }
    }

    const addToCart = async (productVariantId, quantity = 1) => {
        try {
            const response = await cartAPI.addToCart({
                product_variant_id: productVariantId,
                quantity
            })
            
            if (response.data.success) {
                toast.success('Item added to cart!')
                fetchCart()
                fetchCartCount()
                return { success: true }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add item to cart')
            return { success: false, error: error.response?.data?.message }
        }
    }

    const updateCartItem = async (productVariantId, quantity) => {
        try {
            const response = await cartAPI.updateCartItem({
                product_variant_id: productVariantId,
                quantity
            })
            
            if (response.data.success) {
                fetchCart()
                fetchCartCount()
                return { success: true }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update cart')
            return { success: false }
        }
    }

    const removeFromCart = async (productVariantId) => {
        try {
            const response = await cartAPI.removeFromCart({
                product_variant_id: productVariantId
            })
            
            if (response.data.success) {
                toast.success('Item removed from cart')
                fetchCart()
                fetchCartCount()
                return { success: true }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item')
            return { success: false }
        }
    }

    const clearCart = async () => {
        try {
            const response = await cartAPI.clearCart()
            if (response.data.success) {
                setCartItems([])
                setCartCount(0)
                setCartSummary({ totalItems: 0, subtotal: 0, tax: 0, total: 0 })
                toast.success('Cart cleared')
                return { success: true }
            }
        } catch (error) {
            toast.error('Failed to clear cart')
            return { success: false }
        }
    }

    const validateCartStock = async () => {
        try {
            const response = await cartAPI.validateStock()
            return response.data
        } catch (error) {
            toast.error('Failed to validate cart stock')
            return { success: false }
        }
    }

    const value = {
        cartItems,
        cartCount,
        cartSummary,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        validateCartStock,
        fetchCart,
        fetchCartCount
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within CartProvider')
    }
    return context
}