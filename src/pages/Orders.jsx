import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ordersAPI } from '../api/customer.js'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { toast } from 'react-toastify'

const OrderDetailsModal = ({ orderId, isOpen, onClose }) => {
    const [order, setOrder] = useState(null)
    const [trackingInfo, setTrackingInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return
            setLoading(true)
            try {
                const response = await ordersAPI.getOrderById(orderId)
                if (response.data.success) {
                    const { order: responseOrder, items } = response.data.data
                    setOrder({ ...responseOrder, items })
                }
            } catch (err) {
                toast.error('Failed to load order details')
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [orderId,onClose])



    const handleTrackOrder = async () => {
        setLoading(true)
        try {
            const response = await ordersAPI.trackOrder(order.id)
            if (response.data.success) {
                setTrackingInfo(response.data.data)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch tracking information')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return

        try {
            const response = await ordersAPI.cancelOrder(order.id)
            if (response.data.success) {
                toast.success('Order cancelled successfully')
                onClose()
                setOrder(null)
                setTrackingInfo(null)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order')
        }
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'shipped': return 'bg-purple-100 text-purple-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (!order) return null

    return (
        <Modal isOpen={isOpen} onClose={() => { onClose(); setOrder(null); setTrackingInfo(null) }} title={`Order #${order.id}`} size="lg">
            <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.delivery_status)}`}>
                            {order.delivery_status?.toUpperCase() || 'PENDING'}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                            Ordered on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">₹{parseFloat(order.final_total).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{order.payment_mode?.toUpperCase()}</p>
                    </div>
                </div>

                {/* Order Items */}
                <div>
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-3">
                        {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400">📦</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">{item.product_name}</h4>
                                    <p className="text-sm text-gray-600">{item.variant_name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">₹{parseFloat(item.price).toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">each</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Address */}
                {order.delivery_address && (
                    <div>
                        <h3 className="font-semibold mb-2">Delivery Address</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">{order.delivery_address.address}</p>
                            <p className="text-sm text-gray-600">
                                {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tracking Information */}
                {trackingInfo && (
                    <div>
                        <h3 className="font-semibold mb-2">Tracking Information</h3>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm"><strong>Status:</strong> {trackingInfo.status}</p>
                            <p className="text-sm"><strong>Last Update:</strong> {trackingInfo.last_update}</p>
                            {trackingInfo.awb_number && (
                                <p className="text-sm"><strong>AWB:</strong> {trackingInfo.awb_number}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        onClick={handleTrackOrder}
                        loading={loading}
                        variant="outline"
                        className="flex-1"
                    >
                        Track Order
                    </Button>
                    {['pending', 'processing'].includes(order.delivery_status?.toLowerCase()) && (
                        <Button
                            onClick={handleCancelOrder}
                            variant="danger"
                            className="flex-1"
                        >
                            Cancel Order
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    )
}

const Orders = () => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [filterStatus, setFilterStatus] = useState('all')

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [paginationLoading, setPaginationLoading] = useState(false)

    useEffect(() =>{
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        fetchOrders()
    }, [isAuthenticated, navigate, filterStatus, currentPage])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await ordersAPI.getOrders({
                page: 1,
                limit: 10,
                status: filterStatus !== 'all' ? filterStatus : undefined
            })
            if (response.data?.success) {
                setOrders(response.data.data?.orders || [])
                const { currentPage, totalPages } = response.data.data?.pagination
                setCurrentPage(currentPage)
                setTotalPages(totalPages)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }


    const handleOrderClick = (order) => {
        setSelectedOrder(order?.id)
        setShowDetailsModal(true)
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'shipped': return 'bg-purple-100 text-purple-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true
        return order.delivery_status?.toLowerCase() === filterStatus
    })

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <Button onClick={() => navigate('/')} variant="outline">
                    Continue Shopping
                </Button>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => {setFilterStatus(status);setCurrentPage(1)}}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
                    <p className="text-gray-600 mb-6">
                        {filterStatus === 'all'
                            ? "You haven't placed any orders yet."
                            : `No orders with status: ${filterStatus}`
                        }
                    </p>
                    <Button onClick={() => navigate('/')}>
                        Start Shopping
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => handleOrderClick(order)}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.delivery_status)}`}>
                                        {order.delivery_status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900">₹{parseFloat(order.final_total).toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">{order.payment_mode?.toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Click to view details →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || paginationLoading}
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || paginationLoading}
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            )}


            {/* Order Details Modal */}
            <OrderDetailsModal
                orderId={selectedOrder}
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
            />
        </div>
    )
}

export default Orders
