import { Link } from '@inertiajs/react';
import useAuthStore from '@/Stores/useAuthStore';
import { ROUTES, resolveRoute } from '@/Lib/routes';

export default function Header({ onToggleSidebar }) {
    const profile = useAuthStore((state) => state.profile);
    const unreadCount = useAuthStore((state) => state.notifications?.unread_count ?? 0);

    return (
        <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 md:hidden"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href={resolveRoute(ROUTES.notificationsIndex)}
                        className="relative rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                        <svg
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    <div className="flex items-center gap-2">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                profile?.name ?? 'User',
                            )}& background=9333ea & color=fff`}
                            alt={profile?.name ?? 'User'}
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            {profile?.name ?? 'User'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
