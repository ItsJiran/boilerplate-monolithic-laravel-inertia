import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import useAppBroadcast from '@/Hooks/useAppBroadcast';
import axios from 'axios';
import useFlashStore from '@/Stores/useFlashStore';

export default function SocketTest() {
    const [messages, setMessages] = useState([]);
    const { isConnected } = useAppBroadcast();

    const triggerEvent = async () => {
        try {
            const response = await axios.get(route('test.trigger_socket'));
            useFlashStore.getState().setFlash({ status: 'success', message: response.data.message });
        } catch (error) {
            useFlashStore.getState().setFlash({ status: 'error', message: 'Failed to trigger socket event' });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Socket Connection Test" />
            <div className="max-w-4xl max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Socket Status</h2>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                        </div>

                        <button
                            onClick={triggerEvent}
                            disabled={!isConnected}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition"
                        >
                            Trigger Server Event
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
