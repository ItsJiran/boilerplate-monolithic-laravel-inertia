import { Link } from '@inertiajs/react';

export default function Button({
    children,
    onClick,
    isLoading = false,
    loadingText = 'Processing...',
    type = 'button',
    disabled = false,
    className = '',
    variant = 'primary',
    size = 'md',
    href,
}) {
    const baseClasses =
        'font-medium transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const computedSizeClass = sizeClasses[size] ?? sizeClasses.md;

    const variantClasses =
        variant === 'white'
            ? 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
            : 'bg-purple-600 hover:bg-purple-700 text-white';

    const content = isLoading ? (
        <>
            {/* Simple generic spinner SVG */}
            <svg
                className="animate-spin h-5 w-5 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            {loadingText}
        </>
    ) : (
        children
    );

    if (href) {
        return (
            <Link
                href={href}
                className={`${baseClasses} ${computedSizeClass} ${variantClasses} ${className}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseClasses} ${computedSizeClass} ${variantClasses} ${className}`}
        >
            {content}
        </button>
    );
}
