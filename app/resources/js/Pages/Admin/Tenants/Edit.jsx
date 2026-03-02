import DashboardLayout from '@/Layouts/DashboardLayout';
import Breadcrumbs from '@/Components/ui/atoms/Breadcrumbs';
import Card from '@/Components/ui/atoms/Card';
import CardHeader from '@/Components/ui/atoms/CardHeader';
import CardBody from '@/Components/ui/atoms/CardBody';
import CardFooter from '@/Components/ui/atoms/CardFooter';
import Heading from '@/Components/ui/atoms/Heading';
import InputGroup from '@/Components/ui/atoms/InputGroup';
import Paragraph from '@/Components/ui/atoms/Paragraph';
import SidebarCard from '@/Components/ui/atoms/SidebarCard';
import SidebarListItem from '@/Components/ui/atoms/SidebarListItem';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ tenant }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: tenant.name,
        slug: tenant.slug,
        profile_path: tenant.profile_path ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route('tenants.update', tenant));
    };

    return (
        <DashboardLayout>
            <Head title={`Edit ${tenant.name}`} />

            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: 'Tenants', href: route('tenants.index') },
                        { label: tenant.name, href: route('tenants.show', tenant) },
                        { label: 'Edit' },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Heading className="text-lg">Edit Tenant</Heading>
                                    <Paragraph size="sm" className="text-gray-600 mt-1">
                                        Update tenant information and configuration
                                    </Paragraph>
                                </div>
                                <Link
                                    href={route('tenants.show', tenant)}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </CardHeader>

                        <CardBody>
                            <div className="space-y-6">
                                <InputGroup
                                    label="Tenant Name"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    placeholder="Enter tenant name"
                                    error={errors.name}
                                    helper="The display name for this tenant"
                                />

                                <InputGroup
                                    label="Slug"
                                    value={data.slug}
                                    onChange={(event) => setData('slug', event.target.value)}
                                    placeholder="tenant-slug"
                                    error={errors.slug}
                                    helper="URL-friendly identifier (lowercase, no spaces)"
                                />

                                <InputGroup
                                    label="Profile Path"
                                    value={data.profile_path}
                                    onChange={(event) => setData('profile_path', event.target.value)}
                                    placeholder="/path/to/profile"
                                    error={errors.profile_path}
                                    helper="Optional custom profile path for this tenant"
                                />
                            </div>
                        </CardBody>

                        <CardFooter className="flex items-center justify-between">
                            <Link
                                href={route('tenants.show', tenant)}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                ← Back to Details
                            </Link>
                            <div className="flex gap-3">
                                <Link
                                    href={route('tenants.show', tenant)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    onClick={submit}
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <SidebarCard title="Guidance">
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                                </svg>
                            }
                            title="Tenant Name"
                            description="Keep it descriptive and unique in your organization."
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                                </svg>
                            }
                            title="Slug"
                            description="Must remain unique. Changing it affects URLs."
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                                </svg>
                            }
                            title="Profile Path"
                            description="Optional path connecting tenant assets."
                        />
                    </SidebarCard>

                    <SidebarCard title="Current Values">
                        <SidebarListItem
                            title="Name"
                            description={tenant.name}
                        />
                        <SidebarListItem
                            title="Slug"
                            description={tenant.slug}
                        />
                        <SidebarListItem
                            title="Profile Path"
                            description={tenant.profile_path ?? 'Not set'}
                        />
                    </SidebarCard>

                    <SidebarCard title="Important">
                        <Paragraph size="xs">
                            Any slug change impacts linked integrations and existing links. Proceed only when necessary.
                        </Paragraph>
                    </SidebarCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
