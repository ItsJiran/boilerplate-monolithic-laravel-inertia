import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

// Ambil nilai dari meta tag HTML
const reverbKey = document.querySelector('meta[name="reverb-app-key"]')?.getAttribute('content');
const reverbHost = document.querySelector('meta[name="reverb-host"]')?.getAttribute('content');
const reverbScheme = document.querySelector('meta[name="reverb-scheme"]')?.getAttribute('content') ?? 'https';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: 80,
    wssPort: 443,
    forceTLS: reverbScheme === 'https' || window.location.protocol === 'https:',
    enabledTransports: ['ws', 'wss'],
});

window.Echo.connector.pusher.connection.bind('connected', () => {
    const socketId = window.Echo.socketId();
    window.axios.defaults.headers.common['X-Socket-ID'] = socketId;
});