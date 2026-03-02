import { useMemo } from 'react';
import useAuthStore from '@/Stores/useAuthStore';
import { resolveRoute } from '@/Lib/routes';

const baseMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', routeName: 'dashboard' },
    // Add your module menus here
    { id: 'test_db', label: 'Test Database', icon: 'database', routeName: 'test.db', roles: ['superadmin'] },
    { id: 'test_socket', label: 'Test Socket', icon: 'activity', routeName: 'test.socket', roles: ['superadmin'] },
    { id: 'test_notif', label: 'Test Notification', icon: 'bell', routeName: 'test.notification', roles: ['superadmin'] },
    { id: 'settings', label: 'Settings', icon: 'settings', routeName: 'settings' },
];

export default function usePageHook(url) {
    const canViewAdminSections = useAuthStore((state) => state.canViewAdminSections);

    const menuItems = useMemo(
        () =>
            baseMenu
                .filter((item) => {
                    if (!item.roles) {
                        return true;
                    }

                    return item.roles.includes('superadmin') && canViewAdminSections;
                })
                .map((item) => ({
                    ...item,
                    href: typeof route === 'function' && route().has(item.routeName)
                        ? route(item.routeName, item.params)
                        : resolveRoute(item.routeName, item.params),
                })),
        [canViewAdminSections],
    );

    return {
        baseMenu,
        menuItems,
    };
}
