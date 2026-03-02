import { Link } from '@inertiajs/react';
import { resolveRoute, ROUTES } from '@/Lib/routes';

export default function MarketingActivityRow({ activity, isHighlighted, showMarketingColumn }) {
    // Calculate days left until expiry
    const getDaysLeft = () => {
        if (!activity.expired_at) return null;
        const expiredDate = new Date(activity.expired_at.replace(' ', 'T'));
        const today = new Date();
        const diffTime = expiredDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysLeft();
    const isExpired = daysLeft !== null && daysLeft < 0;

    // Determine row highlight based on days left
    let rowClass = 'hover:bg-gray-50 border-b border-gray-100';
    if (isHighlighted) {
        rowClass = 'bg-yellow-50 border-y-2 border-yellow-400 shadow-inner relative z-10';
    } else if (isExpired) {
        rowClass = 'bg-red-50 hover:bg-red-100 border-b border-red-100';
    } else if (daysLeft !== null && daysLeft <= 14) {
        rowClass = 'bg-orange-50 hover:bg-orange-100 border-b border-orange-100';
    } else if (daysLeft !== null && daysLeft <= 30) {
        rowClass = 'bg-yellow-50 hover:bg-yellow-100 border-b border-yellow-100';
    }

    // Determine text color for the date based on days left
    let dateColorClass = 'text-gray-700';
    let iconColorClass = 'text-gray-400';
    let badge = null;

    if (isExpired) {
        dateColorClass = 'text-red-600 font-bold';
        iconColorClass = 'text-red-500';
        badge = <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Expired</span>;
    } else if (daysLeft !== null && daysLeft <= 14) {
        dateColorClass = 'text-orange-600 font-semibold';
        iconColorClass = 'text-orange-500';
        badge = <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">Sangat Dekat</span>;
    } else if (daysLeft !== null && daysLeft <= 30) {
        dateColorClass = 'text-yellow-600 font-medium';
        iconColorClass = 'text-yellow-500';
        badge = <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Mendekati</span>;
    } else if (daysLeft !== null && daysLeft <= 60) {
        dateColorClass = 'text-blue-600';
        iconColorClass = 'text-blue-500';
    } else if (daysLeft !== null) {
        dateColorClass = 'text-emerald-600';
        iconColorClass = 'text-emerald-500';
    }

    const getAvatarUrl = (name, path) => {
        if (path) return path;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&color=7F9CF5&background=E9D8FD`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString.replace(' ', 'T'));
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    return (
        <tr className={`transition-all duration-1000 ${rowClass}`}>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <img 
                        src={getAvatarUrl(activity.customer?.contact_name, null)} 
                        alt={activity.customer?.contact_name} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                        <div className="text-gray-900 font-medium">
                            {activity.customer?.contact_name ?? '-'}
                        </div>
                        {activity.customer?.customer_type_label && (
                            <div className="text-xs text-gray-500 mt-0.5">
                                {activity.customer.customer_type_label}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5">
                    {/* 1. Marketing Activity Status */}
                    <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-xs font-medium text-purple-700">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {activity.status_label ?? activity.status ?? '-'}
                    </span>
                    
                    {/* 2. Marketing Type */}
                    {activity.marketing_type_label && (
                        <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {activity.marketing_type_label}
                        </span>
                    )}

                    {/* 3. Current Stage Status */}
                    {activity.current_stage && (
                        <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {activity.current_stage.stage_label} - {activity.current_stage.status_label}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className={`flex items-center gap-1.5 text-sm ${dateColorClass}`}>
                    <svg className={`w-4 h-4 ${iconColorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(activity.expired_at)}</span>
                    {badge}
                </div>
            </td>
            {showMarketingColumn && (
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src={getAvatarUrl(activity.marketing?.name, activity.marketing?.profile_path)} 
                            alt={activity.marketing?.name} 
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <span className="text-gray-700 text-sm font-medium">
                            {activity.marketing?.name ?? '-'}
                        </span>
                    </div>
                </td>
            )}
            <td className="px-6 py-4">
                <Link
                    href={resolveRoute(
                        ROUTES.marketingActivitiesShow,
                        { activity: activity.id },
                    )}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                    Lihat Detail &rarr;
                </Link>
            </td>
        </tr>
    );
}
