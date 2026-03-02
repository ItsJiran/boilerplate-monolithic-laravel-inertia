export default function CardFooter({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}>
            {children}
        </div>
    );
}
