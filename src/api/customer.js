import CustomerApi from './axios.js'

export const authAPI = {
    sendOtp: (data) => CustomerApi.post('/auth/send-otp', data),
    verifyOtp: (data) => CustomerApi.post('/auth/verify-otp', data),
    register: (data) => CustomerApi.post('/auth/register', data),
    login: (data) => CustomerApi.post('/auth/login', data),
    logout: () => CustomerApi.post('/auth/logout'),
    refreshToken: () => CustomerApi.post('/auth/refresh-token'),
    getCurrentCustomer: () => CustomerApi.get('/profile'),
    updateProfile: (data) => CustomerApi.patch('/profile', data),
    changePassword: (data) => CustomerApi.post('/auth/change-password', data)
}

export const productsAPI = {
    //products
    getAllProducts: () => CustomerApi.get('/products'),
    getPaginatedProducts:()=>CustomerApi.get('/products/paginated'),
    getVariants:(id)=>CustomerApi.get(`/products/variant/${id}`),
    getProductById: (id) => CustomerApi.get(`/products/${id}`),
    //categories
    getCategories: () => CustomerApi.get('/categories'),
    getCategoryById: (id) => CustomerApi.get('/categories/category',{ params: { id } }),
    getPaginatedCategories: () => CustomerApi.get('/categories/paginated'),
    getSubcategoriesByCategory: (categoryId) => CustomerApi.get(`/categories/subcategories/${categoryId}`),
    getProductsByCategory: (categoryId) => CustomerApi.get(`/categories/products/${categoryId}`),
    //subcategories
    getSubcategories: () => CustomerApi.get('/subcategories'),
    getPaginatedSubcategories: () => CustomerApi.get('/subcategories/paginated'),
    getProductsBySubcategory: (subcategoryId) => CustomerApi.get(`/subcategories/products/${subcategoryId}`)
}

export const cartAPI = {
    getCart: () => CustomerApi.get('/cart'),
    addToCart: (data) => CustomerApi.post('/cart', data),
    updateCartItem: (data) => CustomerApi.patch('/cart/update', data),
    removeFromCart: (data) => CustomerApi.delete('/cart/remove', { data }),
    clearCart: () => CustomerApi.delete('/cart'),
    getCartCount: () => CustomerApi.get('/cart/count'),
    getCartSummary: () => CustomerApi.get('/cart/summary'),
    validateStock: () => CustomerApi.post('/cart/validate')
}

export const addressAPI = {
    getAddresses: () => CustomerApi.get('/addresses'),
    getAddressById: (id) => CustomerApi.get(`/addresses/${id}`),
    createAddress: (data) => CustomerApi.post('/addresses', data),
    updateAddress: (id, data) => CustomerApi.patch(`/addresses/${id}`, data),
    deleteAddress: (id) => CustomerApi.delete(`/addresses/${id}`),
    getDefaultAddress: () => CustomerApi.get('/addresses/default'),
    setDefaultAddress: (id) => CustomerApi.patch(`/addresses/set-default/${id}`)
}

export const ordersAPI = {
    createOrder: (data) => CustomerApi.post('/orders', data),
    getOrders: (params) => CustomerApi.get('/orders', { params }),
    getOrderById: (id) => CustomerApi.get(`/orders/${id}`),
    trackOrder: (id) => CustomerApi.get(`/orders/track/${id}`),
    cancelOrder: (id) => CustomerApi.post(`/orders/cancel/${id}`)
}

export default CustomerApi
