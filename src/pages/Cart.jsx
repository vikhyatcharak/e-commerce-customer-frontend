import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { addressAPI } from '../api/customer.js'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import Input from '../components/common/Input.jsx'
import { toast } from 'react-toastify'

const AddressModal = ({ isOpen, onClose, onAddressAdded }) => {
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        is_default: false
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await addressAPI.createAddress(formData)
            if (response.data.success) {
                toast.success('Address added successfully!')
                onAddressAdded()
                onClose()
                setFormData({
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                    is_default: false
                })
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add address')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Address">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="City"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        required
                    />
                    <Input
                        label="State"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                        required
                    />
                    <Input
                        label="Country"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        required
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                        className="mr-2"
                    />
                    <label htmlFor="is_default" className="text-sm">Set as default address</label>
                </div>
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} className="flex-1">
                        Add Address
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

const Cart = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { cartItems, cartSummary, updateCartItem, removeFromCart, validateCartStock } = useCart()
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        fetchAddresses()
    }, [isAuthenticated, navigate])

    const fetchAddresses = async () => {
        try {
            const response = await addressAPI.getAddresses()
            if (response.data.success) {
                const addressList = response.data.data || []
                setAddresses(addressList)

                // Auto-select default address
                const defaultAddr = addressList.find(addr => addr.is_default)
                if (defaultAddr) {
                    setSelectedAddress(defaultAddr.id)
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
        }
    }

    const updateQuantity = async (variantId, newQuantity) => {
        if (newQuantity < 0) return

        const item = cartItems.find(item => item.product_variant_id === variantId)
        if (newQuantity > item.stock) {
            toast.warning('Cannot exceed available stock')
            return
        }

        await updateCartItem(variantId, newQuantity)
    }

    const handleRemoveItem = async (variantId) => {
        if (confirm('Remove this item from cart?')) {
            await removeFromCart(variantId)
        }
    }

    const handleProceedToPayment = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address')
            return
        }

        // Validate stock before proceeding
        setLoading(true)
        const validation = await validateCartStock()
        setLoading(false)

        if (!validation.success || !validation.data.isValid) {
            toast.error('Some items in your cart are out of stock. Please review your cart.')
            return
        }

        // Navigate to payment with selected address
        navigate('/payment', {
            state: {
                addressId: selectedAddress,
                cartSummary
            }
        })
    }

    if (!isAuthenticated) {
        return null
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
                    <Button onClick={() => navigate('/')}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Cart Items ({cartItems.length})</h2>

                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item.product_variant_id} className="flex items-center gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-gray-400 text-2xl">📦</span>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                                            <p className="text-sm text-gray-600">{item.variant_name}</p>
                                            <p className="text-lg font-semibold text-blue-600 mt-1">₹{item.price}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.stock > 0 ? `${item.stock} available` : 'Out of stock'}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.product_variant_id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <span className="text-lg font-medium px-4">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_variant_id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Total and Remove */}
                                        <div className="text-right">
                                            <p className="text-lg font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            <button
                                                onClick={() => handleRemoveItem(item.product_variant_id)}
                                                className="text-red-600 hover:text-red-800 text-sm mt-1"
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary and Address */}
                <div className="space-y-6">
                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Delivery Address</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddressModal(true)}
                            >
                                + Add
                            </Button>
                        </div>

                        {addresses.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No addresses found. Please add one.</p>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((address) => (
                                    <label
                                        key={address.id}
                                        className={`block p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddress === address.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            value={address.id}
                                            checked={selectedAddress === address.id}
                                            onChange={(e) => setSelectedAddress(parseInt(e.target.value))}
                                            className="sr-only"
                                        />
                                        <div className="text-sm">
                                            <p className="font-medium">{address.address}</p>
                                            <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                                            {address.is_default && (
                                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal ({cartSummary.totalItems} items)</span>
                                <span>₹{cartSummary.subtotal?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>₹{cartSummary.tax?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>₹{cartSummary.total?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleProceedToPayment}
                            loading={loading}
                            disabled={!selectedAddress || cartItems.length === 0}
                            className="w-full mt-6"
                            size="lg"
                        >
                            Proceed to Payment
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                            Currently supporting Cash on Delivery only
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            <AddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onAddressAdded={fetchAddresses}
            />
        </div>
    )
}

export default Cart
