import DashboardLayout from '@/Layouts/DashboardLayout';
import Breadcrumbs from '@/Components/ui/atoms/Breadcrumbs';
import Card from '@/Components/ui/atoms/Card';
import CardBody from '@/Components/ui/atoms/CardBody';
import Heading from '@/Components/ui/atoms/Heading';
import Paragraph from '@/Components/ui/atoms/Paragraph';
import SidebarCard from '@/Components/ui/atoms/SidebarCard';
import SidebarListItem from '@/Components/ui/atoms/SidebarListItem';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ tenant }) {
    const form = useForm();

    const handleDestroy = () => {
        if (!confirm('Yakin ingin mengarsipkan tenant ini? Aksi ini bersifat permanen.')) {
            return;
        }

        form.delete(route('tenants.destroy', tenant));
    };

    return (
        <DashboardLayout>
            <Head title={tenant.name} />

            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: 'Tenants', href: route('tenants.index') },
                        { label: tenant.name },
                    ]}
                />
            </div>

            <Card>
                <CardBody>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-2xl">
                                    {tenant.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <Heading className="text-2xl">{tenant.name}</Heading>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1">
                                        {tenant.slug}
                                    </span>
                                    <span className="text-gray-500">ID: {tenant.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={route('user-roles.index', { tenant_id: tenant.id })}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            >
                                Role Assignments
                            </Link>
                            <Link
                                href={route('tenants.edit', tenant)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            >
                                Edit
                            </Link>
                            <button
                                type="button"
                                onClick={handleDestroy}
                                disabled={form.processing}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50"
                            >
                                {form.processing ? 'Archiving...' : 'Archive'}
                            </button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <Heading className="text-sm uppercase tracking-wider font-semibold text-gray-900">
                                    Tenant Details
                                </Heading>
                            </div>
                            <dl className="space-y-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Tenant Name</dt>
                                    <dd className="text-sm font-medium text-gray-900">{tenant.name}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Slug</dt>
                                    <dd className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1">
                                        {tenant.slug}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Profile Path</dt>
                                    <dd className="text-sm text-gray-900">
                                        {tenant.profile_path ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-green-500"></div>
                                                <span>{tenant.profile_path}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Not configured</span>
                                        )}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Created At</dt>
                                    <dd className="text-sm text-gray-900">{tenant.created_at}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Status</dt>
                                    <dd className="text-xs font-medium flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500"></div>
                                        <span className="text-green-700">Active</span>
                                    </dd>
                                </div>
                            </dl>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <Heading className="text-sm uppercase tracking-wider font-semibold text-gray-900">
                                    Recent Activity
                                </Heading>
                            </div>
                            <div className="space-y-4 mt-4">
                                <div className="flex gap-3 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-purple-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <Paragraph className="text-sm font-medium text-gray-900">Tenant Created</Paragraph>
                                        <Paragraph size="xs" className="text-gray-500">
                                            {tenant.created_at}
                                        </Paragraph>
                                    </div>
                                </div>
                                <div className="flex gap-3 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <Paragraph className="text-sm font-medium text-gray-900">Configuration Updated</Paragraph>
                                        <Paragraph size="xs" className="text-gray-500">
                                            Profile path configured
                                        </Paragraph>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-green-50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <Paragraph className="text-sm font-medium text-gray-900">Tenant Activated</Paragraph>
                                        <Paragraph size="xs" className="text-gray-500">Ready to use</Paragraph>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <SidebarCard title="Quick Actions">
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            }
                            title="Edit Tenant"
                            description={
                                <Link
                                    href={route('tenants.edit', tenant)}
                                    className="text-purple-700 hover:underline"
                                >
                                    Open edit form
                                </Link>
                            }
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14m-7 4v6" />
                                </svg>
                            }
                            title="Archive Tenant"
                            description={
                                <button
                                    onClick={handleDestroy}
                                    disabled={form.processing}
                                    className="text-red-600 hover:underline disabled:text-red-300"
                                >
                                    {form.processing ? 'Archiving...' : 'Archive now'}
                                </button>
                            }
                        />
                    </SidebarCard>

                    <SidebarCard title="About Tenants">
                        <Paragraph size="xs">
                            Tenants represent isolated environments for your application. Each tenant has its own data and configuration.
                        </Paragraph>
                    </SidebarCard>

                    <SidebarCard title="Statistics">
                        <SidebarListItem title="Users" description="0" />
                        <SidebarListItem title="Projects" description="0" />
                        <SidebarListItem title="Storage Used" description="0 MB" />
                    </SidebarCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
