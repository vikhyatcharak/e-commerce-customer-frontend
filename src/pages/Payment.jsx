import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { ordersAPI, addressAPI, productsAPI } from '../api/customer.js'
import Button from '../components/common/Button.jsx'
import { toast } from 'react-toastify'

const Payment = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, customer } = useAuth()
    const { cartItems, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [address, setAddress] = useState(null)
    const [discount, setDiscount] = useState(0)
    const [selectedCouponCode, setSelectedCouponCode] = useState(null)
    const [coupon, setCoupon] = useState(null)
    const [paymentMode] = useState('cod') // Only COD for now

    const { addressId, cartSummary: passedSummary } = location.state || {}

    const deliveryCharge = passedSummary.subtotal > 500 ? 0 : 50
    const updatedTotal = (passedSummary.total || 0) + deliveryCharge - (discount || 0)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (!addressId || cartItems.length === 0) {
            navigate('/cart')
            return
        }

        fetchAddress()
    }, [isAuthenticated, addressId, cartItems.length, navigate])

    const fetchAddress = async () => {
        try {
            const response = await addressAPI.getAddressById(addressId)
            if (response.data.success) {
                setAddress(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching address:', error)
            toast.error('Failed to load delivery address')
            navigate('/cart')
        }
    }

    const handlePlaceOrder = async () => {
        setLoading(true)

        try {
            const orderData = {
                address_id: addressId,
                payment_mode: paymentMode,
                cartSummary: passedSummary,
                delivery_charge: deliveryCharge,
                couponCode: selectedCouponCode,
                discount: discount
            }

            const response = await ordersAPI.createOrder(orderData)

            if (response.data.success) {
                // Clear cart after successful order
                await clearCart()

                toast.success('Order placed successfully!')

                setSelectedCouponCode(null)
                setCoupon(null)
                setDiscount(0)
                // Navigate to order confirmation
                navigate('/order-confirmation', {
                    state: {
                        order: response.data.data.order,
                        message: 'Your order has been placed successfully!'
                    }
                })
            }
        } catch (error) {
            console.error('Error placing order:', error)
            toast.error(error.response?.data?.message || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    const handleApplyCoupon = async () => {
        if (!selectedCouponCode) return toast.error("Please enter a coupon code")
        setLoading(true)
        try {
            const response = await productsAPI.getCoupon(selectedCouponCode)
            const data = response.data.data

            if (!response.data.success || !data) {
                throw new Error("Invalid coupon code")
            }

            // Validate coupon expiry
            const now = new Date()
            const expiryDate = new Date(data.valid_to_date)
            if (data.end_time) {
                const [hours, minutes] = data.end_time.split(':')
                expiryDate.setHours(+hours)
                expiryDate.setMinutes(+minutes)
            }

            if (now > expiryDate) {
                throw new Error("Coupon expired")
            }

            if (data.quantity <= 0) {
                throw new Error("Coupon usage limit reached")
            }

            // Calculate discount
            let discountAmount = 0
            if (data.flat_discount) {
                discountAmount = data.flat_discount * 1.00
            } else if (data.percentage_discount) {
                discountAmount = (data.percentage_discount / 100) * passedSummary.subtotal
            }

            setCoupon(data)
            setDiscount(discountAmount)
            toast.success(`Coupon "${data.code}" applied! You saved ₹${discountAmount.toFixed(2)}`)
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message || "Failed to apply coupon"
            )
            setCoupon(null)
            setDiscount(0)
        }finally{
            setLoading(false)
        }
    }


    if (!isAuthenticated || !address) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Order</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Details */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {customer?.name}</p>
                            <p><span className="font-medium">Email:</span> {customer?.email || 'Not provided'}</p>
                            <p><span className="font-medium">Phone:</span> {customer?.phone}</p>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                        <div className="text-sm">
                            <p className="font-medium">{address.address}</p>
                            <p className="text-gray-600">{address.city}, {address.state}</p>
                            <p className="text-gray-600">{address.country} - {address.pincode}</p>
                        </div>
                    </div>

                    {/* Coupon addition */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Apply Coupon</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={selectedCouponCode || ''}
                                onChange={(e) => setSelectedCouponCode(e.target.value.trim())}
                                placeholder="Enter Coupon Code"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                disabled={!selectedCouponCode}
                                onClick={handleApplyCoupon}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                            >
                                Apply
                            </button>
                        </div>
                    </div>


                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    💰
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Online payment options (Credit Card, UPI, Net Banking) will be available soon!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                        {/* Order Items */}
                        <div className="space-y-3 mb-6">
                            {cartItems.map((item) => (
                                <div key={item.product_variant_id} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-gray-600">{item.variant_name} × {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal ({passedSummary.totalItems} items)</span>
                                <span>₹{passedSummary.subtotal?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (GST)</span>
                                <span>₹{passedSummary.tax?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charges</span>
                                <span className="text-green-600">{passedSummary.subtotal > 500 ? "FREE" : "50"}</span>
                            </div>
                            {discount && (
                                <div className="flex justify-between">
                                    <span>Coupon "{coupon?.code}" applied</span>
                                    <span className="text-red-600">-₹{discount.toFixed(2) || '0.00'}</span>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total Amount</span>
                                    <span>₹{updatedTotal.toFixed(2)}</span>
                                </div>
                            </div>

                        </div>

                        {/* Place Order Button */}
                        <Button
                            onClick={handlePlaceOrder}
                            loading={loading}
                            className="w-full mt-6"
                            size="lg"
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                            By placing this order, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment
