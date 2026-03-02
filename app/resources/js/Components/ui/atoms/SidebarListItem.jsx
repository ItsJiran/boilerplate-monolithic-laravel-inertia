import Paragraph from './Paragraph';

export default function SidebarListItem({
    badge,
    title,
    description,
    icon,
    className = '',
}) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                {badge ?? icon}
            </div>
            <div>
                <Paragraph size="xs" className="text-gray-900 font-semibold mb-0.5">
                    {title}
                </Paragraph>
                <Paragraph size="xs" className="text-gray-600">
                    {description}
                </Paragraph>
            </div>
        </div>
    );
}
