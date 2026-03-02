export default function StatCard({ title, value, label, trend, trendUp, iconPath, iconBg, iconColor, className = '' }) {
    return (
        <div className={`bg-white p-6 border border-gray-200 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${iconBg} flex items-center justify-center`}>
                    <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {iconPath}
                    </svg>
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 ${trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}
