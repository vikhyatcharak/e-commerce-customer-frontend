import axios from 'axios'
import qs from 'qs'


const CustomerApi = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/customer',
    withCredentials: true,
})

CustomerApi.interceptors.request.use((config) => {
    if ((config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if (config.data) {
            config.data = qs.stringify(config.data)
        }
    }
    const token = localStorage.getItem('customerToken')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
},
    (error) => Promise.reject(error)
)

CustomerApi.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        try {
            const { data } = await CustomerApi.post('/auth/refresh-token')
            localStorage.setItem('customerToken', data.data.accessToken)
            CustomerApi.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`
            return CustomerApi(originalRequest)
        } catch (refreshError) {
            console.error("Token refresh failed:", refreshError)
            localStorage.removeItem('customerToken')
            // Optionally redirect to login
            // window.location.href = '/login'
            return Promise.reject(refreshError)
        }
    }
    return Promise.reject(error)
})

export default CustomerApi