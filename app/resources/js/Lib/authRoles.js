import useAuthStore from '@/Stores/useAuthStore';

function roleExists(roleList, slug) {
    if (!Array.isArray(roleList) || !slug) {
        return false;
    }

    return roleList.some(
        (role) => role?.slug?.toString() === slug?.toString(),
    );
}

function tenantKeyFor(tenantId) {
    if (tenantId === undefined || tenantId === null || tenantId === '') {
        return 'global';
    }

    return tenantId?.toString() ?? 'global';
}

export function checkRoleInTenant(roles, slug, tenantId) {
    if (!slug) {
        return false;
    }

    const tenants = roles?.tenants ?? {};
    const targetKey = tenantKeyFor(tenantId);

    if (roleExists(tenants[targetKey], slug)) {
        return true;
    }

    if (tenantId && roleExists(tenants.global, slug)) {
        return true;
    }

    return false;
}

export function useHasRole(slug) {
    return useAuthStore((state) => Boolean(state.roles?.role_keys?.[slug]));
}

export function useHasRoleInTenant(slug, tenantId) {
    return useAuthStore((state) => checkRoleInTenant(state.roles, slug, tenantId));
}
