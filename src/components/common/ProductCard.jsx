import React from 'react'
import Button from './Button.jsx'

const ProductCard = ({ product, onViewDetails }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📦</span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                    </p>
                )}

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(product)}
                        className="flex-1"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
