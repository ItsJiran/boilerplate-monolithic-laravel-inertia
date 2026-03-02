import DashboardLayout from '@/Layouts/DashboardLayout';
import Breadcrumbs from '@/Components/ui/atoms/Breadcrumbs';
import Card from '@/Components/ui/atoms/Card';
import CardHeader from '@/Components/ui/atoms/CardHeader';
import CardBody from '@/Components/ui/atoms/CardBody';
import CardFooter from '@/Components/ui/atoms/CardFooter';
import Heading from '@/Components/ui/atoms/Heading';
import InputGroup from '@/Components/ui/atoms/InputGroup';
import Paragraph from '@/Components/ui/atoms/Paragraph';
import PreviewCard from '@/Components/ui/atoms/PreviewCard';
import SidebarCard from '@/Components/ui/atoms/SidebarCard';
import SidebarListItem from '@/Components/ui/atoms/SidebarListItem';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        profile_path: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('tenants.store'), {
            onSuccess: () => reset(),
        });
    };

    const generateSlug = (text) =>
        text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

    const handleNameChange = (event) => {
        const name = event.target.value;
        setData('name', name);

        if (!data.slug || data.slug === generateSlug(data.name)) {
            setData('slug', generateSlug(name));
        }
    };

    return (
        <DashboardLayout>
            <Head title="Create Tenant" />

            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: 'Tenants', href: route('tenants.index') },
                        { label: 'Create New' },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Heading className="text-lg">Create New Tenant</Heading>
                                    <Paragraph size="sm" className="text-gray-600 mt-1">
                                        Add a new tenant to your organization
                                    </Paragraph>
                                </div>
                                <Link
                                    href={route('tenants.index')}
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
                                    onChange={handleNameChange}
                                    placeholder="e.g., Acme Corporation"
                                    error={errors.name}
                                    helper="The display name for this tenant"
                                />

                                <InputGroup
                                    label="Slug"
                                    value={data.slug}
                                    onChange={(event) => setData('slug', event.target.value)}
                                    placeholder="acme-corporation"
                                    error={errors.slug}
                                    helper="Auto-generated from name. URL-friendly identifier (lowercase, no spaces)"
                                    adornment={
                                        data.slug ? (
                                            <svg
                                                className="w-4 h-4 text-green-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        ) : null
                                    }
                                />

                                <InputGroup
                                    label="Profile Path"
                                    value={data.profile_path}
                                    onChange={(event) => setData('profile_path', event.target.value)}
                                    placeholder="/avatars/tenant.png"
                                    error={errors.profile_path}
                                    helper="Custom profile path for this tenant (can be set later)"
                                />

                                <PreviewCard name={data.name} slug={data.slug} />
                            </div>
                        </CardBody>

                        <CardFooter className="flex items-center justify-between">
                            <Link
                                href={route('tenants.index')}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                ← Back to List
                            </Link>
                            <div className="flex gap-3">
                                <Link
                                    href={route('tenants.index')}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    onClick={submit}
                                    disabled={processing || !data.name || !data.slug}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creating...' : 'Create Tenant'}
                                </button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <SidebarCard title="Getting Started">
                        <SidebarListItem
                            badge="1"
                            title="Enter tenant name"
                            description="Choose a descriptive name for your tenant"
                        />
                        <SidebarListItem
                            badge="2"
                            title="Review the slug"
                            description="Slug is auto-generated but can be adjusted"
                        />
                        <SidebarListItem
                            badge="3"
                            title="Set profile path"
                            description="Optional - add a custom profile path"
                        />
                    </SidebarCard>

                    <SidebarCard title="Field Guide">
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                                </svg>
                            }
                            title="Tenant Name"
                            description="The display name shown throughout the application. Can be changed later."
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                                </svg>
                            }
                            title="Slug"
                            description="Must be unique and URL-safe. Automatically generated from the tenant name."
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
                                </svg>
                            }
                            title="Profile Path"
                            description="Optional path for tenant-specific profile configuration."
                        />
                    </SidebarCard>

                    <SidebarCard title="Pro Tip">
                        <Paragraph size="xs">
                            The slug is automatically generated as you type the tenant name. You can still edit it manually if needed.
                        </Paragraph>
                    </SidebarCard>

                    <SidebarCard title="Requirements">
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                            title="Tenant name is required"
                            description=""
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                            title="Slug must be unique"
                            description=""
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                            title="Slug must be URL-safe"
                            description=""
                        />
                        <SidebarListItem
                            icon={
                                <svg className="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                            title="Profile path is optional"
                            description=""
                        />
                    </SidebarCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
