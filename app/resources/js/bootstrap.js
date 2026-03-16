import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

// Ambil nilai dari meta tag HTML
const reverbKey = document.querySelector('meta[name="reverb-app-key"]')?.getAttribute('content');
const rawReverbHost = document.querySelector('meta[name="reverb-host"]')?.getAttribute('content') ?? '';
const rawReverbScheme = document.querySelector('meta[name="reverb-scheme"]')?.getAttribute('content') ?? 'https';

const normalizedReverbScheme = rawReverbScheme
    .trim()
    .toLowerCase()
    .replace(/:\/\/$/, '')
    .replace(/:\/$/, '')
    .replace(/\/$/, '');

// Prevent malformed ws URL such as `wss://https//reverb.myapp.test`.
const normalizedReverbHost = rawReverbHost
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^https?\/\//i, '')
    .replace(/^wss?:\/\//i, '')
    .replace(/\/.*$/, '');

const wsHost = normalizedReverbHost || window.location.hostname;
const forceTLS = normalizedReverbScheme === 'https' || normalizedReverbScheme === 'wss' || window.location.protocol === 'https:';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost,
    wsPort: 80,
    wssPort: 443,
    forceTLS,
    enabledTransports: ['ws', 'wss'],
});

window.Echo.connector.pusher.connection.bind('connected', () => {
    const socketId = window.Echo.socketId();
    window.axios.defaults.headers.common['X-Socket-ID'] = socketId;
});