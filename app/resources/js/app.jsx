import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import useAuthStore from '@/Stores/useAuthStore';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Add X-Socket-ID to Inertia requests
router.on('before', (event) => {
    if (window.Echo && window.Echo.socketId()) {
        event.detail.visit.headers['X-Socket-ID'] = window.Echo.socketId();
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        useAuthStore.getState().hydrate(props?.auth);
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
