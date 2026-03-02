import { useMemo, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/ui/atoms/Button';
import IndexHeader from '@/Components/ui/atoms/IndexHeader';
import IndexTableCard from '@/Components/ui/atoms/IndexTableCard';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ notifications, unreadCount = 0 }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredNotifications = useMemo(() => {
        return notifications.data.filter((notification) => {
            const matchesSearch =
                notification.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (notification.body ?? '')
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'read' && notification.read_at) ||
                (statusFilter === 'new' && !notification.read_at);

            return matchesSearch && matchesStatus;
        });
    }, [notifications.data, searchQuery, statusFilter]);
    
    const markRead = (notificationId) => {
        router.patch(route('notifications.read', notificationId));
    };

    const markAllRead = () => {
        if (unreadCount === 0) {
            return;
        }
        router.patch(route('notifications.read_all'));
    };

    return (
        <DashboardLayout>
            <Head title="Notifikasi" />

            <div className="space-y-6">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Notifikasi
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Anda memiliki {unreadCount} notifikasi belum dibaca.
                    </p>
                    <button
                        type="button"
                        onClick={markAllRead}
                        disabled={unreadCount === 0}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:bg-gray-50"
                    >
                        Tandai Semua Dibaca
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-semibold text-gray-900">
                                    {notifications.data.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Total Notifikasi
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-semibold text-gray-900">
                                    {unreadCount}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Belum Dibaca
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-yellow-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-semibold text-gray-900">
                                    {notifications.data.length - unreadCount}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Sudah Dibaca
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-green-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Filter & Pencarian
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Cari judul atau detail notifikasi..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600 transition-colors"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600 transition-colors"
                            >
                                <option value="all">Semua Status</option>
                                <option value="new">Belum Dibaca</option>
                                <option value="read">Sudah Dibaca</option>
                            </select>
                            {(searchQuery || statusFilter !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                    }}
                                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications Table */}
                <div className="bg-white border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Judul
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Detail
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredNotifications.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                {searchQuery || statusFilter !== 'all' 
                                                    ? 'Tidak ada notifikasi yang sesuai'
                                                    : 'Belum ada notifikasi'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {searchQuery || statusFilter !== 'all'
                                                    ? 'Coba ubah filter atau pencarian Anda'
                                                    : 'Notifikasi akan muncul di sini'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filteredNotifications.map((notification) => (
                                <tr 
                                    key={notification.id} 
                                    className={`hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-purple-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 ${notification.read_at ? 'bg-gray-400' : 'bg-yellow-500'}`}></div>
                                            <span className={`text-xs font-medium ${notification.read_at ? 'text-gray-600' : 'text-yellow-700'}`}>
                                                {notification.read_at ? 'Dibaca' : 'Baru'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {notification.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <p className="text-gray-700">
                                                {notification.body ?? '-'}
                                            </p>
                                            {notification.meta_json?.marketing_activity_id && (
                                                <Link
                                                    href={route(
                                                        'marketing.activities.show',
                                                        notification.meta_json.marketing_activity_id,
                                                    )}
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                                >
                                                    Lihat Aktivitas
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {!notification.read_at && (
                                            <button
                                                type="button"
                                                onClick={() => markRead(notification.id)}
                                                className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                            >
                                                Tandai Dibaca
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Table Footer with Stats */}
                    {filteredNotifications.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                            <div>
                                Menampilkan{' '}
                                <span className="font-medium text-gray-900">
                                    {filteredNotifications.length}
                                </span>{' '}
                                dari{' '}
                                <span className="font-medium text-gray-900">
                                    {notifications.data.length}
                                </span>{' '}
                                notifikasi
                            </div>
                            <div className="font-mono">
                                {new Date().toLocaleDateString('id-ID', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {notifications.links?.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {notifications.links.map((link, index) => (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url ?? '#'}
                                preserveState
                                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                                    link.active
                                        ? 'bg-purple-600 border-purple-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                } ${link.url ? '' : 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
