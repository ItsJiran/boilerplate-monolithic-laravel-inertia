export default function Paragraph({
    size = 'base',
    className = '',
    children,
}) {
    const sizeMap = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-sm',
        md: 'text-base',
    };

    return (
        <p className={`${sizeMap[size] ?? sizeMap.base} text-gray-600 ${className}`}>
            {children}
        </p>
    );
}
