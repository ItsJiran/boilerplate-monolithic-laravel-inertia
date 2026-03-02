import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';

export default function SettingsPage({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout>
            <Head title="Pengaturan Akun" />

            <div className="space-y-6">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Pengaturan Akun
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Kelola informasi profil, kata sandi, dan akun Anda.
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="bg-green-50 border border-green-200 p-4">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-green-800">{status}</p>
                        </div>
                    </div>
                )}

                {/* Settings Cards */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Profile Information */}
                    <div className="bg-white border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Informasi Profil
                            </h2>
                            <p className="mt-1 text-xs text-gray-600">
                                Update informasi profil dan alamat email akun Anda
                            </p>
                        </div>
                        <div className="p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>
                    </div>

                    {/* Update Password */}
                    <div className="bg-white border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Kata Sandi
                            </h2>
                            <p className="mt-1 text-xs text-gray-600">
                                Pastikan akun Anda menggunakan password yang kuat untuk keamanan
                            </p>
                        </div>
                        <div className="p-6">
                            <UpdatePasswordForm />
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-white border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Hapus Akun
                            </h2>
                            <p className="mt-1 text-xs text-gray-600">
                                Hapus akun Anda secara permanen beserta semua data yang terkait
                            </p>
                        </div>
                        <div className="p-6">
                            <DeleteUserForm />
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 p-4">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                Keamanan Akun
                            </h3>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Pastikan untuk menggunakan password yang kuat dan unik. Kami merekomendasikan menggunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk keamanan maksimal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}