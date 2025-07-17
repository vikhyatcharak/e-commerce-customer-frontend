import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { addressAPI } from '../api/customer.js'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import Input from '../components/common/Input.jsx'
import { toast } from 'react-toastify'

const AddressModal = ({ address, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        is_default: false
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (address) {
            setFormData({
                address: address.address || '',
                city: address.city || '',
                state: address.state || '',
                pincode: address.pincode || '',
                country: address.country || 'India',
                is_default: address.is_default || false
            })
        } else {
            setFormData({
                address: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India',
                is_default: false
            })
        }
        setErrors({})
    }, [address, isOpen])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}))
        if (errors[name]) {
            setErrors(prev => ({...prev,[name]: ''}))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.address.trim()) newErrors.address = 'Address is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.state.trim()) newErrors.state = 'State is required'
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
        else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits'
        if (!formData.country.trim()) newErrors.country = 'Country is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        try {
            let response
            if (address) {
                response = await addressAPI.updateAddress(address?.id, formData)
                toast.success('Address updated successfully!')
            } else {
                response = await addressAPI.createAddress(formData)
                toast.success('Address added successfully!')
            }

            if (response.data?.success) {
                onSuccess()
                onClose()
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Failed to save address')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={address ? 'Edit Address' : 'Add New Address'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    placeholder="House no., Street, Area"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        error={errors.city}
                        required
                    />
                    <Input
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        error={errors.state}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        error={errors.pincode}
                        placeholder="6-digit pincode"
                        required
                    />
                    <Input
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        error={errors.country}
                        required
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_default"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                        Set as default address
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        className="flex-1"
                    >
                        {address ? 'Update Address' : 'Add Address'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

const Addresses = () => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        fetchAddresses()
    }, [isAuthenticated, navigate, showAddressModal])

    const fetchAddresses = async () => {
        try {
            setLoading(true)
            const response = await addressAPI.getAddresses()
            if (response.data?.success) {
                setAddresses(response.data.data || [])
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
            toast.error(error.response?.data?.message || 'Failed to load addresses')
        } finally {
            setLoading(false)
        }
    }

    const handleAddAddress = () => {
        setEditingAddress(null)
        setShowAddressModal(true)
    }

    const handleEditAddress = (address) => {
        setEditingAddress(address)
        setShowAddressModal(true)
    }

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return

        try {
            const response = await addressAPI.deleteAddress(addressId)
            if (response.data?.success) {
                toast.success('Address deleted successfully!')
                fetchAddresses()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete address')
        }
    }

    const handleSetDefault = async (addressId) => {
        try {
            const response = await addressAPI.setDefaultAddress(addressId)
            if (response.data?.success) {
                toast.success('Default address updated!')
                fetchAddresses()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set default address')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
                <Button onClick={handleAddAddress}>
                    + Add New Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📍</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No addresses found</h2>
                    <p className="text-gray-600 mb-6">Add your first address to get started with deliveries.</p>
                    <Button onClick={handleAddAddress}>
                        Add Address
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900">Address {address.id}</h3>
                                        {address.is_default && (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mb-2">{address.address}</p>
                                    <p className="text-sm text-gray-600">
                                        {address.city}, {address.state}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {address.country} - {address.pincode}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditAddress(address)}
                                    className="flex-1"
                                >
                                    Edit
                                </Button>
                                {!address.is_default && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetDefault(address.id)}
                                        className="flex-1"
                                    >
                                        Set Default
                                    </Button>
                                )}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteAddress(address.id)}
                                    disabled={address.is_default}
                                    className="flex-1"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Address Modal */}
            <AddressModal
                address={editingAddress}
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSuccess={fetchAddresses}
            />
        </div>
    )
}

export default Addresses
