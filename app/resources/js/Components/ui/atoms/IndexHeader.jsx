export default function IndexHeader({
    title,
    description,
    action,
    success,
    children,
}) {
    return (
        <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-gray-600">{description}</p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>

            {success && (
                <div className="mt-4 border-l-4 border-green-500 bg-green-50 p-3">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}
