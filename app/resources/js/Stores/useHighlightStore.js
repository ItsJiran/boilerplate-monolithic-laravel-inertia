import { create } from 'zustand';

const HIGHLIGHT_DURATION = 5000; // 5 seconds highlight duration

const useHighlightStore = create((set, get) => ({
    // Store highlighted items by entity type (e.g. { marketing_activity: [1, 2], customer: [3] })
    highlightedItems: {},

    // Internal registry to track and clear timeouts
    _timeouts: {},

    addHighlight: (entityType, id) => {
        set((state) => {
            const currentHighlights = state.highlightedItems[entityType] || [];
            if (!currentHighlights.includes(id)) {
                return {
                    highlightedItems: {
                        ...state.highlightedItems,
                        [entityType]: [...currentHighlights, id]
                    }
                };
            }
            return state;
        });

        // Manage timeout logic to automatically un-highlight
        const timerKey = `${entityType}_${id}`;

        // Clear any existing timeout for this specific entity/id combo to reset the timer
        if (get()._timeouts[timerKey]) {
            clearTimeout(get()._timeouts[timerKey]);
        }

        const newTimeout = setTimeout(() => {
            get().removeHighlight(entityType, id);
        }, HIGHLIGHT_DURATION);

        // Save the new timeout reference
        set((state) => ({
            _timeouts: {
                ...state._timeouts,
                [timerKey]: newTimeout
            }
        }));
    },

    removeHighlight: (entityType, id) => {
        set((state) => {
            const currentHighlights = state.highlightedItems[entityType] || [];
            if (currentHighlights.includes(id)) {
                return {
                    highlightedItems: {
                        ...state.highlightedItems,
                        [entityType]: currentHighlights.filter(itemId => itemId !== id)
                    }
                };
            }
            return state;
        });

        // Cleanup the timeout reference
        const timerKey = `${entityType}_${id}`;
        set((state) => {
            const newTimeouts = { ...state._timeouts };
            delete newTimeouts[timerKey];
            return { _timeouts: newTimeouts };
        });
    },

    clearHighlights: (entityType = null) => {
        set((state) => {
            if (entityType) {
                // Clear specific entity type

                // Clear all related timeouts
                const newTimeouts = { ...state._timeouts };
                Object.keys(newTimeouts).forEach(key => {
                    if (key.startsWith(`${entityType}_`)) {
                        clearTimeout(newTimeouts[key]);
                        delete newTimeouts[key];
                    }
                });

                return {
                    highlightedItems: {
                        ...state.highlightedItems,
                        [entityType]: []
                    },
                    _timeouts: newTimeouts
                };
            } else {
                // Clear everything
                Object.values(state._timeouts).forEach(clearTimeout);
                return {
                    highlightedItems: {},
                    _timeouts: {}
                };
            }
        });
    }
}));

export default useHighlightStore;
