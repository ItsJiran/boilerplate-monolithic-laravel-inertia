import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import useAuthStore from '@/Stores/useAuthStore';
import useBroadcast from '@/Hooks/useBroadcast';
import { useCurrentTenantId } from '@/Hooks/useTenantSelection';
import useHighlightStore from '@/Stores/useHighlightStore';

export default function useAppBroadcast() {
    const { component } = usePage();
    const profile = useAuthStore((state) => state.profile);
    const tenantId = useCurrentTenantId();
    const [isConnected, setIsConnected] = useState(() => {
        const connectionState = window?.Echo?.connector?.pusher?.connection?.state;
        return connectionState === 'connected';
    });

    useEffect(() => {
        const connection = window?.Echo?.connector?.pusher?.connection;
        if (!connection) {
            setIsConnected(false);
            return;
        }

        const handleConnected = () => setIsConnected(true);
        const handleDisconnected = () => setIsConnected(false);

        connection.bind('connected', handleConnected);
        connection.bind('disconnected', handleDisconnected);
        connection.bind('unavailable', handleDisconnected);
        connection.bind('failed', handleDisconnected);

        return () => {
            connection.unbind('connected', handleConnected);
            connection.unbind('disconnected', handleDisconnected);
            connection.unbind('unavailable', handleDisconnected);
            connection.unbind('failed', handleDisconnected);
        };
    }, []);

    // Automatically listen to the test channel in Developer Mode
    // A leading dot is required because the backend event uses a custom `broadcastAs` name.
    useBroadcast('test-channel', '.test.message', (data) => {
        if (import.meta.env.VITE_APP_ENV === 'development') {
            console.log('📻 [DEV MODE] Test Broadcast Received:', data);
        }
    });

    // Determine the private channel name for the authenticated user
    const userPrivateChannel = profile?.id ? `user.${profile.id}` : null;

    // Listen for NEW notifications being created
    useBroadcast(userPrivateChannel, '.notification.created', (data) => {
        console.log('🔄 Notification Count Created. Unread:', data.unreadCount);
        // Update the Zustand store's unread count immediately
        useAuthStore.setState((state) => ({
            notifications: {
                ...state.notifications,
                unread_count: data.unreadCount
            }
        }));
    }, 'private');

    // Listen for notification state UPDATES (e.g., marked as read)
    useBroadcast(userPrivateChannel, '.notification.updated', (data) => {
        console.log('🔄 Notification Count Updated. Unread:', data.unreadCount);
        // Update the Zustand store's unread count immediately
        useAuthStore.setState((state) => ({
            notifications: {
                ...state.notifications,
                unread_count: data.unreadCount
            }
        }));
    }, 'private');

    // Helper to reload the relevant page section after a marketing activity event
    const handleMarketingActivityEvent = (eventName, data) => {
        console.log(`📢 [Marketing] Activity ${eventName}:`, data);

        if (data?.activity?.id) {
            useHighlightStore.getState().addHighlight('marketing_activity', data.activity.id);
        }

        if (data?.activity?.current_stage?.stage_type) {
            useHighlightStore.getState().addHighlight('stage_type', data.activity.current_stage.stage_type);
        }

        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        const urlObj = new URL(currentUrl, window.location.origin);
        const path = urlObj.pathname;

        // 1. Dashboard
        if (path === '/dashboard' || path.startsWith('/dashboard/')) {
            router.reload({
                only: ['tenantActivityData', 'stageTypeData', 'stageTypeUniqueData', 'activeActivities', 'activeActivitiesPagination'],
                preserveScroll: true,
                preserveState: true,
            });
        }

        // 2. Database Public (Customer Index)
        else if (path === '/customers') {
            router.reload({
                only: ['customersPagination', 'stats'],
                preserveScroll: true,
                preserveState: true,
            });
        }

        // 3. Customer Detail
        else if (path.startsWith('/customers/')) {
            const pathParts = path.split('/');
            // For URLs like /customers/123
            if (pathParts.length >= 3 && pathParts[2] !== 'create') {
                const customerIdFromUrl = pathParts[2];
                if (data?.customer?.id && String(data.customer.id) === String(customerIdFromUrl)) {
                    router.reload({
                        only: ['customer', 'activities'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            }
        }

        // 4. Marketing Activity Detail
        else if (path.startsWith('/activities/')) {
            const pathParts = path.split('/');
            // For URLs like /activities/123
            if (pathParts.length >= 3 && pathParts[2] !== 'create') {
                const activityIdFromUrl = pathParts[2];
                if (data?.activity?.id && String(data.activity.id) === String(activityIdFromUrl)) {
                    router.reload({
                        only: ['activity', 'stages'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                }
            }
        }

        // 5. Marketing Activities Index
        else if (path === '/activities') {
            router.reload({
                only: ['activities', 'stageTypeOptions', 'allTabTotal'],
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    // --- Tenant Channel (Admin scope) ---
    // Admins and superadmins can access this channel (authorized in channels.php).
    // The backend broadcasts activity events here so admins see ALL activity changes in the tenant.
    const tenantAdminChannel = tenantId ? `tenant.${tenantId}.role.admin` : null;
    useBroadcast(tenantAdminChannel, '.tenant.message', (data) => {
        console.log('📢 [Current Tenant Admin] Broadcast Received:', data);
    }, 'private');
    useBroadcast(tenantAdminChannel, '.activity.created', (data) => handleMarketingActivityEvent('Created', data), 'private');
    useBroadcast(tenantAdminChannel, '.activity.updated', (data) => handleMarketingActivityEvent('Updated', data), 'private');

    // --- Tenant Channel (Marketing scope) ---
    const tenantMarketingChannel = tenantId ? `tenant.${tenantId}.role.marketing` : null;
    useBroadcast(tenantMarketingChannel, '.tenant.message', (data) => {
        console.log('📢 [Current Tenant Marketing] Broadcast Received:', data);
    }, 'private');

    // --- User Private Channel (Marketing scope) ---
    // Marketing users also receive activity events on their own private channel.
    // The backend only dispatches to `user.{marketingId}` — so they only see their OWN activities.
    // (The tenant channel above is already subscribed; handleMarketingActivityEvent is idempotent.)
    useBroadcast(userPrivateChannel, '.activity.created', (data) => handleMarketingActivityEvent('Created', data), 'private');
    useBroadcast(userPrivateChannel, '.activity.updated', (data) => handleMarketingActivityEvent('Updated', data), 'private');

    return {
        isConnected,
    };
}
