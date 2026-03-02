import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import useFlashStore from '@/Stores/useFlashStore';

export default function NotificationTest() {
    const [formData, setFormData] = useState({
        title: 'Test Notification',
        body: 'This is a test notification generated from the boilerplate.',
        type: 'info'
    });

    const triggerEvent = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route('test.trigger_notification'), formData);
            useFlashStore.getState().setFlash({ status: 'success', message: response.data.message });
        } catch (error) {
            useFlashStore.getState().setFlash({ status: 'error', message: 'Failed to trigger notification event' });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Notification Feature Test" />
            <div className="max-w-4xl max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h2 className="text-xl font-semibold mb-6">Test App Notifications</h2>

                        <form onSubmit={triggerEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                >
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Body</label>
                                <textarea
                                    value={formData.body}
                                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                            >
                                Send Notification to Myself
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
