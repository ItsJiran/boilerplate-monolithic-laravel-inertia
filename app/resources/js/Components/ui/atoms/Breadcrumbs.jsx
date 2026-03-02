import { Link } from '@inertiajs/react';

export default function Breadcrumbs({ items = [], className = '' }) {
    return (
        <nav className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
            {items.map((item, index) => (
                <span key={item.label} className="flex items-center gap-2">
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-purple-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.label}</span>
                    )}
                    {index < items.length - 1 && (
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    )}
                </span>
            ))}
        </nav>
    );
}
