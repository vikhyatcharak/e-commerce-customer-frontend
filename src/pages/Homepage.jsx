import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsAPI } from '../api/customer.js'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/common/ProductCard.jsx'
import Modal from '../components/common/Modal.jsx'
import Button from '../components/common/Button.jsx'
import { toast } from 'react-toastify'

const ProductModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart()
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (product?.variants?.length > 0) {
            setSelectedVariant(product.variants[0])
        }
    }, [product])

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error('Please select a variant')
            return
        }

        if (quantity > selectedVariant.stock) {
            toast.error('Quantity exceeds available stock')
            return
        }

        const result = await addToCart(selectedVariant.id, quantity)
        if (result.success) {
            onClose()
            setQuantity(1)
        }
    }

    const adjustQuantity = (delta) => {
        const newQuantity = quantity + delta
        if (newQuantity < 1) return
        if (newQuantity > selectedVariant?.stock) {
            toast.warning('Cannot exceed available stock')
            return
        }
        setQuantity(newQuantity)
    }

    if (!product) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            size="lg"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-6xl text-gray-400">📦</span>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                        {product.description && (
                            <p className="text-gray-600">{product.description}</p>
                        )}
                    </div>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold mb-3">Available Variants</h4>
                            <div className="space-y-3">
                                {product.variants.map((variant) => (
                                    <div
                                        key={variant.id}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedVariant?.id === variant.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{variant.variant_name}</h5>
                                                {variant.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{variant.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-lg font-semibold text-blue-600">
                                                        ₹{variant.price}
                                                    </span>
                                                    <span className={`text-sm ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity and Add to Cart */}
                    {selectedVariant && selectedVariant.stock > 0 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => adjustQuantity(-1)}
                                        disabled={quantity <= 1}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        -
                                    </button>
                                    <span className="text-lg font-medium px-4">{quantity}</span>
                                    <button
                                        onClick={() => adjustQuantity(1)}
                                        disabled={quantity >= selectedVariant.stock}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                className="w-full"
                                size="lg"
                            >
                                Add to Cart - ₹{(selectedVariant.price * quantity).toFixed(2)}
                            </Button>
                        </div>
                    )}

                    {selectedVariant && selectedVariant.stock === 0 && (
                        <div className="text-center py-4">
                            <p className="text-red-600 font-medium">This variant is out of stock</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}

const Homepage = () => {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showProductModal, setShowProductModal] = useState(false)
    const [filters, setFilters] = useState({
        category: '',
        subcategory: '',
        search: ''
    })

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [filters])

    const fetchInitialData = async () => {
        try {
            const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
                productsAPI.getAllProducts(),
                productsAPI.getCategories(),
                productsAPI.getSubcategories()
            ])

            if (productsRes.data.success) {
                setProducts(productsRes.data.data.products || [])
            }
            if (categoriesRes.data.success) {
                setCategories(categoriesRes.data.data.categories || [])
            }
            if (subcategoriesRes.data.success) {
                setSubcategories(subcategoriesRes.data.data.subcategories || [])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            let response
            if (filters.category) {
                response = await productsAPI.getProductsByCategory(filters.category)
            } else if (filters.subcategory) {
                response = await productsAPI.getProductsBySubcategory(filters.subcategory)
            } else {
                response = await productsAPI.getAllProducts()
            }

            if (response.data.success) {
                let filteredProducts = response.data.data || []

                if (filters.search) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                        product.description?.toLowerCase().includes(filters.search.toLowerCase())
                    )
                }

                setProducts(filteredProducts)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleProductView = (product) => {
        setSelectedProduct(product)
        setShowProductModal(true)
    }

    const handleQuickAddToCart = async (variantId) => {
        await addToCart(variantId, 1)
    }

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value,
            // Reset dependent filters
            ...(filterType === 'category' && { subcategory: '' })
        }))
    }

    const filteredSubcategories = subcategories.filter(sub =>
        !filters.category || sub.category_id === parseInt(filters.category)
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8 mb-8">
                <h1 className="text-4xl font-bold mb-4">Welcome to ShopEase</h1>
                <p className="text-xl opacity-90">Discover amazing products at great prices</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Filter Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                        <select
                            value={filters.subcategory}
                            onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!filters.category}
                        >
                            <option value="">All Subcategories</option>
                            {filteredSubcategories.map(subcategory => (
                                <option key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={() => setFilters({ category: '', subcategory: '', search: '' })}
                            variant="outline"
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Products ({products.length})
                    </h2>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onViewDetails={handleProductView}
                                onAddToCart={handleQuickAddToCart}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
            />
        </div>
    )
}

export default Homepage
