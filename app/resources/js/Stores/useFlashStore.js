import { create } from 'zustand';

let toastIdCounter = 0;

const TOAST_DURATION = 4000; // 4 seconds auto-dismiss

/**
 * Zustand store for managing flash toast notifications.
 * 
 * Usage:
 *   const { toasts, addToast, removeToast } = useFlashStore();
 *   addToast('success', 'Berhasil disimpan!');
 *   addToast('error', 'Terjadi kesalahan.');
 */
const useFlashStore = create((set, get) => ({
    toasts: [],
    _timers: {},

    addToast: (type, message, duration = TOAST_DURATION) => {
        const id = ++toastIdCounter;

        set((state) => ({
            toasts: [...state.toasts, { id, type, message, duration }],
        }));

        // Auto-dismiss
        const timer = setTimeout(() => {
            get().removeToast(id);
        }, duration);

        set((state) => ({
            _timers: { ...state._timers, [id]: timer },
        }));
    },

    removeToast: (id) => {
        // Clear any pending auto-dismiss timer
        const timer = get()._timers[id];
        if (timer) {
            clearTimeout(timer);
        }

        set((state) => {
            const newTimers = { ...state._timers };
            delete newTimers[id];
            return {
                toasts: state.toasts.filter((t) => t.id !== id),
                _timers: newTimers,
            };
        });
    },
}));

export default useFlashStore;
