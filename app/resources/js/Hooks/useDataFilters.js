import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function useDataFilters({
    initialFilters = {},
    routeLocation,
}) {
    const [filters, setFilters] = useState(initialFilters);
    const [isApplying, setIsApplying] = useState(false);

    // Watch for backend-driven filter resets via Inertia props
    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            ...initialFilters,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(initialFilters)]);

    const buildQueryParams = (overrides = {}) => {
        const currentUrl = typeof window !== 'undefined'
            ? new URL(window.location.href)
            : new URL('http://localhost');
        const params = new URLSearchParams(currentUrl.search);

        const currentFilters = { ...filters, ...overrides };

        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });

        // Ensure we remove keys that are in the URL but not in our active filters (e.g. they were cleared)
        Array.from(params.keys()).forEach((key) => {
            if (key !== 'page' && !(key in currentFilters)) {
                params.delete(key);
            }
        });

        return Object.fromEntries(params.entries());
    };

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = (queryParamsOverrides = {}) => {
        setIsApplying(true);
        const nextParams = buildQueryParams(queryParamsOverrides);

        router.get(routeLocation, nextParams, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsApplying(false),
        });
    };

    const resetFilters = (resetState = {}, queryParamsOverrides = {}) => {
        const defaultState = Object.keys(filters).reduce((acc, key) => {
            acc[key] = '';
            return acc;
        }, {});

        const nextState = { ...defaultState, ...resetState };
        setFilters(nextState);
        setIsApplying(true);

        const nextParamsOverrides = { ...nextState, ...queryParamsOverrides };
        // Remove page if present on reset by default
        if (!('page' in nextParamsOverrides)) {
            nextParamsOverrides.page = undefined;
        }

        const nextParams = buildQueryParams(nextParamsOverrides);

        router.get(routeLocation, nextParams, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsApplying(false),
        });
    };

    return {
        filters,
        setFilter,
        setFilters,
        applyFilters,
        resetFilters,
        isApplying,
        buildQueryParams
    };
}
