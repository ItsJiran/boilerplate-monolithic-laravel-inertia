import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import Heading from '@/Components/ui/atoms/Heading';
import Paragraph from '@/Components/ui/atoms/Paragraph';

export default function Dashboard() {
    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header Section */}
                <div>
                    <Heading className="mb-1">Application Dashboard</Heading>
                    <Paragraph size="sm">
                        Welcome to your unified workspace
                    </Paragraph>
                </div>

                {/* generic content */}
                <div className="bg-white border border-gray-200 p-8 rounded-lg text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <Heading as="h3" size="lg" className="mb-2">Your Workspace is Ready</Heading>
                    <Paragraph className="max-w-md mx-auto">
                        This is your generic dashboard boilerplate. You can start building your application's widgets, charts, and data tables here.
                    </Paragraph>
                </div>
            </div>
        </DashboardLayout>
    );
}
