import React from 'react';
import CardBody from '@/Components/ui/atoms/CardBody';
import CardFooter from '@/Components/ui/atoms/CardFooter';
import Button from '@/Components/ui/atoms/Button';
import UserSearchModal from '@/Components/ui/organisms/UserSearchModal';
import { resolveRoute, ROUTES } from '@/Lib/routes';

export default function MarketingActivitiesFilter({
    filterValues,
    setFilter,
    applyFilter,
    resetFilter,
    isApplying,
    customerTypeSelectOptions,
    statusSelectOptions,
    stageSubStatusSelectOptions,
    marketingName,
    setMarketingName,
    isMarketingModalOpen,
    setIsMarketingModalOpen,
    tenantId,
}) {
    return (
        <form onSubmit={applyFilter}>
            <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer Name filter */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={filterValues.customer_name}
                                onChange={(e) => setFilter('customer_name', e.target.value)}
                                placeholder="Cari nama customer..."
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                            />
                            {filterValues.customer_name && (
                                <button
                                    type="button"
                                    onClick={() => setFilter('customer_name', '')}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-red-400 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Customer Type filter */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Tipe Customer</label>
                        <select
                            value={filterValues.customer_type}
                            onChange={(event) => setFilter('customer_type', event.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {customerTypeSelectOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status filter */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Status Aktivitas</label>
                        <select
                            value={filterValues.status}
                            onChange={(event) => setFilter('status', event.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {statusSelectOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tipe Status filter (Only visible if a specific stage type is selected) */}
                    {filterValues.stage_type && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Tipe Status</label>
                            <select
                                value={filterValues.stage_sub_status}
                                onChange={(event) => setFilter('stage_sub_status', event.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                {stageSubStatusSelectOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Marketing filter */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Marketing</label>
                        <button
                            type="button"
                            onClick={() => setIsMarketingModalOpen(true)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left border border-gray-200 rounded-lg bg-white hover:border-purple-400 transition-colors"
                        >
                            {filterValues.marketing_id ? (
                                <span className="font-medium text-gray-900 truncate">{marketingName}</span>
                            ) : (
                                <span className="text-gray-400">Semua marketing...</span>
                            )}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {filterValues.marketing_id && (
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => { e.stopPropagation(); setFilter('marketing_id', ''); setMarketingName(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), setFilter('marketing_id', ''), setMarketingName(''))}
                                        className="text-gray-300 hover:text-red-400 transition"
                                        title="Hapus"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                )}
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </CardBody>
            <CardFooter className="flex flex-wrap gap-3 justify-end border-t border-gray-100">
                <Button type="submit" isLoading={isApplying}>
                    Terapkan Filter
                </Button>
                <Button
                    type="button"
                    variant="white"
                    onClick={resetFilter}
                >
                    Reset
                </Button>
            </CardFooter>

            <UserSearchModal
                isOpen={isMarketingModalOpen}
                onClose={() => setIsMarketingModalOpen(false)}
                onSelect={(user) => {
                    setFilter('marketing_id', user.id);
                    setMarketingName(user.name);
                }}
                fetchUrl={resolveRoute(ROUTES.marketingActivitiesMarketingUsers)}
                tenantId={tenantId ?? null}
                title="Pilih Marketing untuk Filter"
            />
        </form>
    );
}
