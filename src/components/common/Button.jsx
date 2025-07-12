import React from 'react'

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    className = '',
    type = 'button',
    ...props
}) => {
    const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    }

    const disabledClasses = 'opacity-50 cursor-not-allowed'

    const classes = `
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? disabledClasses : ''}
        ${className}
    `.trim()

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={classes}
            {...props}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                </div>
            ) : children}
        </button>
    )
}

export default Button
