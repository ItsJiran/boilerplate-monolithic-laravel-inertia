import Sidebar from '@/Components/ui/molecules/Sidebar';
import Header from '@/Components/ui/molecules/Header';
import BroadcastListener from '@/Components/wrappers/BroadcastListener';
import FlashNotifier from '@/Components/wrappers/FlashNotifier';
import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import useAuthStore from '@/Stores/useAuthStore';
import usePageHook from '@/Hooks/usePageHook';

export default function DashboardLayout({ children }) {
    const [activeMenu, setActiveMenu] = useState();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { props } = usePage();

    const { bootstrap_active: bootstrapActive, auth: pageAuth } = props;

    // Use the new hook for menus
    const { baseMenu, menuItems } = usePageHook(window.location.href);

    useEffect(() => {
        if (bootstrapActive && pageAuth) {
            useAuthStore.getState().hydrate(pageAuth);
        }
    }, [bootstrapActive, pageAuth]);

    useEffect(() => {
        const match = baseMenu.find((item) =>
            item.routeName ? route().current(item.routeName) : false,
        );

        if (match) {
            setActiveMenu(match.id);
        }
    }, [props.url]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [props.url]);

    return (
        <BroadcastListener>
            <FlashNotifier>
                <div className="flex h-screen bg-gray-50">
                    <Sidebar
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        menuItems={menuItems}
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header onToggleSidebar={() => setSidebarOpen((open) => !open)} />
                        <main className="flex-1 overflow-y-auto p-8">{children}</main>
                    </div>
                </div>
            </FlashNotifier>
        </BroadcastListener>
    );
}
