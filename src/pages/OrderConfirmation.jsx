import React from 'react'

const OrderConfirmation = () => {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-lg text-gray-600">Thank you for your purchase. We'll send you a confirmation email shortly.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-2">What's next?</h2>
                <ul className="text-left space-y-2 text-gray-600">
                    <li>• We'll prepare your order for shipment</li>
                    <li>• You'll receive tracking information via SMS/Email</li>
                    <li>• Your order will be delivered within 3-7 business days</li>
                    <li>• Pay cash on delivery when you receive your order</li>
                </ul>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Continue Shopping
                </button>
                <button
                    onClick={() => window.location.href = '/orders'}
                    className="w-full border border-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    View My Orders
                </button>
            </div>
        </div>
    )
}

export default OrderConfirmation
