export default function Card({ children, className = '' }) {
    return (
        <div className={`bg-white border border-gray-200 ${className}`}>
            {children}
        </div>
    );
}
