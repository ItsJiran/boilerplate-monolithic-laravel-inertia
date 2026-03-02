export default function CardBody({ children, className = '' }) {
    return (
        <div className={`px-6 py-6 ${className}`}>
            {children}
        </div>
    );
}
