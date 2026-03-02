import { create } from 'zustand';

const useAuthStore = create((set) => ({
    profile: null,
    roles: null,
    notifications: null,
    canViewAdminSections: false,
    hydrate(auth) {
        if (!auth?.user) {
            return;
        }

        const roles = auth.user.roles ?? null;

        let canViewAdminSections = false;
        if (roles) {
            const globalRoles = roles.tenants?.global ?? [];
            const rolesSlug = Object.keys(roles.role_keys ?? {});

            canViewAdminSections = globalRoles.some((role) =>
                ['superadmin', 'admin'].includes(role.slug),
            ) || rolesSlug.includes('superadmin') || rolesSlug.includes('admin');
        }

        set({
            profile: auth.user.profile ?? null,
            roles,
            notifications: auth.user.notifications ?? null,
            canViewAdminSections,
        });
    },
}));

export default useAuthStore;
