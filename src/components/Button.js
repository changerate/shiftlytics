"use client"
export default function Button({ 
    children, 
    variant = 'primary', 
    size = 'medium', 
    disabled = false, 
    onClick, 
    className = '',
    type = 'button',
    ...props 
}) {
    // Base button styles
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Variant styles using comprehensive color palette
    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-text-on-primary focus:ring-primary-300 hover:cursor-pointer',
        secondary: 'bg-secondary hover:bg-secondary-hover text-text-on-secondary focus:ring-secondary-300 hover:cursor-pointer',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-text-on-primary focus:ring-primary-300 hover:cursor-pointer',
        noOutlinePrimary: 'text-primary hover:bg-primary hover:text-text-on-primary focus:ring-primary-300 hover:cursor-pointer',
        noOutlineBlack: 'text-black hover:bg-black hover:text-text-on-primary focus:ring-black-300 hover:cursor-pointer',
        ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary focus:ring-neutral-300 hover:cursor-pointer',
        alert: 'bg-alert hover:bg-alert-hover text-text-on-alert focus:ring-alert-300 hover:cursor-pointer',
        success: 'bg-success hover:bg-success-hover text-text-on-primary focus:ring-success-300 hover:cursor-pointer',
        warning: 'bg-warning hover:bg-warning-hover text-text-primary focus:ring-warning-300 hover:cursor-pointer',
        info: 'bg-info hover:bg-info-hover text-text-on-primary focus:ring-info-300 hover:cursor-pointer',
        neutral: 'bg-neutral-100 hover:bg-neutral-200 text-text-primary focus:ring-neutral-300 hover:cursor-pointer',
        minimal: 'text-text-link hover:text-text-link-hover hover:bg-primary-50 focus:ring-primary-300 hover:cursor-pointer'
    };
    
    // Size styles
    const sizes = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-sm',
        large: 'px-6 py-3 text-base'
    };
    
    // Combine all styles
    const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
    
    return (
        <button
        type={type}
        className={buttonStyles}
        disabled={disabled}
        onClick={onClick}
        {...props}
        >
        {children}
        </button>
    );
}
