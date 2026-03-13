import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import useAuthStore from '@/Stores/useAuthStore';

export function useCurrentTenantId(fallback = '') {
    return useMemo(() => {
        if (typeof window === 'undefined') {
            return fallback;
        }
        return new URL(window.location.href).searchParams.get('tenant_id')?.toString() ?? fallback;
    }, [window.location.href, fallback]);
}

export function getCurrentTenantId(fallback = '') {
    if (typeof window === 'undefined') {
        return fallback;
    }
    return new URL(window.location.href).searchParams.get('tenant_id')?.toString() ?? fallback;
}

export default function useTenantSelection({
    dropdownForRole,
    tenantListsByRole = {},
}) {
    const fallbackRoleKeys = useAuthStore((state) => state.roles?.role_keys ?? {});
    const inferredRoles = useMemo(() => Object.keys(fallbackRoleKeys), [fallbackRoleKeys]);
    const resolvedDropdownRoles = useMemo(() => {
        if (dropdownForRole !== undefined && dropdownForRole !== null) {
            return dropdownForRole;
        }
        console.log(inferredRoles);
        if (inferredRoles.length) {
            return inferredRoles;
        }


        return ['global'];
    }, [dropdownForRole, inferredRoles]);

    const normalizedDropdownRoles = useMemo(() => {
        if (!resolvedDropdownRoles || (Array.isArray(resolvedDropdownRoles) && !resolvedDropdownRoles.length)) {
            return [];
        }

        const asArray = Array.isArray(resolvedDropdownRoles)
            ? resolvedDropdownRoles
            : [resolvedDropdownRoles];

        return asArray.map((role) => role?.toString()).filter(Boolean);
    }, [resolvedDropdownRoles]);

    const tenantOptions = useMemo(() => {
        if (!normalizedDropdownRoles.length) {
            return [];
        }

        const seenTenantIds = new Set();
        const combinedOptions = [];

        normalizedDropdownRoles.forEach((role) => {
            const options = tenantListsByRole[role];
            if (!Array.isArray(options)) {
                return;
            }

            options.forEach((tenant) => {
                const tenantId = tenant?.id?.toString();
                if (!tenantId || seenTenantIds.has(tenantId)) {
                    return;
                }

                seenTenantIds.add(tenantId);
                combinedOptions.push(tenant);
            });
        });

        return combinedOptions;
    }, [normalizedDropdownRoles, tenantListsByRole]);

    // default parsed selected tenant id
    const [selectedTenantId, setSelectedTenantId] = useState(() => {
        return getCurrentTenantId(tenantOptions[0]?.id?.toString() ?? '');
    });

    // Method consumer utuk component handle perubahan..
    const handleChange = (value) => {
        setSelectedTenantId(value);
        const parsedUrl = new URL(window.location.href);

        if (value) {
            parsedUrl.searchParams.set('tenant_id', value);
        } else {
            parsedUrl.searchParams.delete('tenant_id');
        }

        router.visit(`${parsedUrl.pathname}${parsedUrl.search}`, {
            preserveState: true,
            replace: true,
        });
    };

    // Update selected tenant ID when tenant options change
    useEffect(() => {
        if (!tenantOptions.length) {
            return;
        }

        setSelectedTenantId((current) => {
            const exists = tenantOptions.some(
                (tenant) => tenant?.id?.toString() === current,
            );

            if (exists) {
                return current;
            }

            return tenantOptions[0]?.id?.toString() ?? '';
        });
    }, [tenantOptions]);

    return {
        selectedTenantId,
        tenantOptions,
        handleChange,
    };
}
