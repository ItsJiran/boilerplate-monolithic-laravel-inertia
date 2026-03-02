import { useMemo, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/ui/atoms/Button';
import Heading from '@/Components/ui/atoms/Heading';
import IndexHeader from '@/Components/ui/atoms/IndexHeader';
import IndexTableCard from '@/Components/ui/atoms/IndexTableCard';
import InputGroup from '@/Components/ui/atoms/InputGroup';
import Paragraph from '@/Components/ui/atoms/Paragraph';
import SelectField from '@/Components/ui/atoms/SelectField';
import StatCard from '@/Components/ui/atoms/StatCard';
import TableWithPagination from '@/Components/ui/molecules/TableWithPagination';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Index({ tenants: serverTenants }) {
    const { props } = usePage();
    const success = props.flash?.success;
    const tenants = serverTenants ?? [];
    const pagination = props.tenantsPagination ?? null;
    const withProfileCount = props.withProfileCount ?? 0;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterProfile, setFilterProfile] = useState('all');


    // Filter tenants based on search and profile filter
    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = 
            tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.slug.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesProfile = 
            filterProfile === 'all' || 
            (filterProfile === 'with-profile' && tenant.profile_path) ||
            (filterProfile === 'without-profile' && !tenant.profile_path);
        
        return matchesSearch && matchesProfile;
    });

    const totalTenants = pagination?.total ?? tenants.length;
    const stats = useMemo(() => [
        {
            id: 'total',
            value: totalTenants,
            label: 'Total Tenants',
            iconBg: 'bg-gradient-to-br from-purple-500 to-purple-700',
            iconColor: 'text-white',
            iconPath: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
            ),
        },
        {
            id: 'profile',
            value: withProfileCount,
            label: 'With Profile',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            iconPath: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            ),
        },
        {
            id: 'filtered',
            value: filteredTenants.length,
            label: 'Current results',
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            iconPath: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
            ),
        },
    ], [totalTenants, withProfileCount, filteredTenants.length]);

    const handlePageChange = (nextPage) => {
        if (!pagination) {
            return;
        }

        router.get(
            route('tenants.index'),
            { page: nextPage },
            { preserveState: true, replace: true },
        );
    };

    return (
        <DashboardLayout>
            <Head title="Tenants" />
            
            <IndexHeader
                title="Tenants"
                description="Manage and organize all your tenants"
                success={success}
                action={
                    <Button
                        href={route('tenants.create')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-sm font-medium"
                    >
                        Create Tenant
                    </Button>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.id}
                            value={stat.value}
                            label={stat.label}
                            iconBg={stat.iconBg}
                            iconColor={stat.iconColor}
                            iconPath={stat.iconPath}
                        />
                    ))}
                </div>

                <div className="bg-white border border-gray-200 p-4">
                    <div className="grid gap-4 md:grid-cols-3 items-end">
                        <InputGroup
                            label="Search tenants"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or slug"
                        />

                        <SelectField
                            label="Profile filter"
                            value={filterProfile}
                            onChange={(e) => setFilterProfile(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Tenants' },
                                { value: 'with-profile', label: 'With Profile' },
                                { value: 'without-profile', label: 'Without Profile' },
                            ]}
                        />

                        {(searchQuery || filterProfile !== 'all') && (
                            <div className="flex justify-end md:justify-start">
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterProfile('all');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors rounded-lg w-full"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </IndexHeader>

            {/* Table Section */}
            <IndexTableCard>
                <div className="mb-6 px-4 pt-4 pb-0">
                    <Heading as="h2" size="md" className="text-gray-900 mb-1">
                        Tenant directory
                    </Heading>
                    <Paragraph size="sm">
                        Explore every tenant and quickly access their detail or edit screens.
                    </Paragraph>
                </div>

            <div className='p-4 pt-0'>
                <TableWithPagination
                    headers={['Tenant', 'Slug', 'Profile', 'Actions']}
                    items={filteredTenants}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    renderRow={(tenant) => (
                        <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <Link
                                    href={route('tenants.show', tenant)}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="w-8 h-8 bg-purple-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-medium text-xs">
                                            {tenant.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                            {tenant.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            ID: {tenant.id}
                                        </div>
                                    </div>
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1">
                                    {tenant.slug}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {tenant.profile_path ? (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500"></div>
                                        <Paragraph size="xs" className="text-gray-700">
                                            {tenant.profile_path}
                                        </Paragraph>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-gray-300"></div>
                                        <Paragraph size="xs" className="text-gray-500">
                                            No profile
                                        </Paragraph>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-3">
                                    <Link
                                        href={route('tenants.show', tenant)}
                                        className="text-xs font-medium text-gray-600 hover:text-purple-600 transition-colors"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={route('tenants.edit', tenant)}
                                        className="text-xs font-medium text-gray-600 hover:text-purple-600 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    )}
                    emptyMessage={
                        searchQuery || filterProfile !== 'all'
                            ? 'Try adjusting your search or filters.'
                            : 'Create your first tenant to get started.'
                    }
                />
                </div>
            </IndexTableCard>

            {/* Footer Info */}
            {filteredTenants.length > 0 && (
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div>
                        Showing <span className="font-medium text-gray-900">{filteredTenants.length}</span> of <span className="font-medium text-gray-900">{totalTenants}</span> results
                    </div>
                    <div>
                        Updated {new Date().toLocaleDateString()}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
