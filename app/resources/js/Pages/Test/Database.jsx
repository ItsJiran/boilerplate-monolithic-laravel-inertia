import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function DatabaseTest() {
    const { status, version, error } = usePage().props;

    return (
        <DashboardLayout>
            <Head title="Database Connection Test" />
            <div className="max-w-4xl max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="font-medium text-gray-500">Status:</div>
                            <div className={status === 'Connected' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                {status}
                            </div>

                            <div className="font-medium text-gray-500">MySQL Version:</div>
                            <div>{version}</div>

                            {error && (
                                <>
                                    <div className="font-medium text-red-500">Error:</div>
                                    <div className="text-red-600 text-sm whitespace-pre-wrap">{error}</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
