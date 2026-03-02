export default function Heading({
    as: Tag = 'h1',
    size = 'lg',
    className = '',
    children,
}) {
    const sizeMap = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-2xl',
        xl: 'text-3xl',
        '2xl': 'text-4xl',
    };

    return (
        <Tag
            className={`${sizeMap[size] ?? sizeMap.lg} font-semibold text-gray-900 ${className}`}
        >
            {children}
        </Tag>
    );
}
