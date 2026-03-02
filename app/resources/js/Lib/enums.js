export const UserRole = {
    ADMIN: 'admin',
    USER: 'user',

    config: {
        admin: { label: 'Admin', value: 'admin', color: 'purple' },
        user: { label: 'User', value: 'user', color: 'blue' },
    }
};

export const TenantStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',

    config: {
        active: { label: 'Active', value: 'active', color: 'green' },
        inactive: { label: 'Inactive', value: 'inactive', color: 'gray' },
    }
};
