/**
 * Helper utilities for building Inertia routes with consistent tenant handling.
 */

export function getTenantIdFromUrl(url) {
    if (!url) {
        return null;
    }

    const [, query = ''] = url.split('?');
    if (!query) {
        return null;
    }

    const params = new URLSearchParams(query);

    return params.get('tenant_id');
}

export function buildRouteWithTenant(routeName, params = {}, tenantId) {
    const mergedParams = { ...params };

    if (tenantId && !Object.prototype.hasOwnProperty.call(mergedParams, 'tenant_id')) {
        mergedParams.tenant_id = tenantId;
    }

    return route(routeName, mergedParams);
}

export const ROUTES = {
    marketingCustomersIndex: 'marketing.customers.index',
    marketingCustomersCreate: 'marketing.customers.create',
    marketingCustomersStore: 'marketing.customers.store',
    marketingCustomersShow: 'marketing.customers.show',
    marketingCustomersEdit: 'marketing.customers.edit',
    marketingCustomersUpdate: 'marketing.customers.update',
    marketingCustomersDestroy: 'marketing.customers.destroy',
    marketingCustomersActivitiesStore: 'marketing.customers.activities.store',
    marketingCustomersIdentitiesIndex: 'marketing.customers.identities.index',
    marketingCustomersIdentitiesCreate: 'marketing.customers.identities.create',
    marketingCustomersIdentitiesStore: 'marketing.customers.identities.store',
    marketingCustomersIdentitiesShow: 'marketing.customers.identities.show',
    marketingCustomersIdentitiesEdit: 'marketing.customers.identities.edit',
    marketingCustomersIdentitiesUpdate: 'marketing.customers.identities.update',
    marketingCustomersIdentitiesDestroy: 'marketing.customers.identities.destroy',
    marketingCustomersRelationsStore: 'marketing.customers.relations.store',
    marketingCustomersRelationsDestroy: 'marketing.customers.relations.destroy',
    marketingCustomersRepresentatives: 'marketing.customers.representatives',
    marketingCustomersRelated: 'marketing.customers.related',
    marketingCustomerImportsIndex: 'marketing.customer-imports.index',
    marketingCustomerImportsCreate: 'marketing.customer-imports.create',
    marketingCustomerImportsStore: 'marketing.customer-imports.store',
    marketingCustomerImportsShow: 'marketing.customer-imports.show',
    marketingCustomerImportsDestroy: 'marketing.customer-imports.destroy',
    marketingCustomerImportsRetry: 'marketing.customer-imports.retry',
    marketingCustomerImportsTemplate: 'marketing.customer-imports.template',
    adminUserRolesIndex: 'user-roles.index',
    adminUserRolesCreate: 'user-roles.create',
    marketingActivitiesIndex: 'marketing.activities.index',
    marketingActivitiesCreate: 'marketing.activities.create',
    marketingActivitiesShow: 'marketing.activities.show',
    marketingActivitiesStore: 'marketing.activities.store',
    marketingActivitiesMarketingUsers: 'marketing.activities.marketing-users',
    notificationsIndex: 'notifications.index',
};

export function resolveRoute(routeValue, params = {}, currentUrl = typeof window !== 'undefined' ? window.location.href : '') {
    const routeName = Object.keys(ROUTES).find(key => ROUTES[key] === routeValue);


    if (!routeName) {
        return console.error(`Unknown route key "${routeValue}"`);
    }

    const tenantId = getTenantIdFromUrl(currentUrl);
    return buildRouteWithTenant(routeValue, params, tenantId);
}
