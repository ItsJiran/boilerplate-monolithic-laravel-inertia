export default function FiltersPeriod({
    uiPeriod,
    setUiPeriod,
    uiStartDate,
    setUiStartDate,
    uiEndDate,
    setUiEndDate,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedWeek,
    setSelectedWeek,
    months,
    availableWeeks,
    handleApplyFilter,
    isLoading,
}) {
    return (
        <div className="bg-white border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Filters
                </h2>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Period
                        </label>
                        <select
                            value={uiPeriod}
                            onChange={(event) => setUiPeriod(event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600 transition-colors bg-white"
                        >
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                            <option value="year">Yearly</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {uiPeriod === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={uiStartDate}
                                    onChange={(event) =>
                                        setUiStartDate(event.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={uiEndDate}
                                    onChange={(event) => setUiEndDate(event.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                                />
                            </div>
                        </div>
                    )}

                    {uiPeriod === 'month' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tahun
                                </label>
                                <input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={selectedYear}
                                    onChange={(event) =>
                                        setSelectedYear(Number(event.target.value))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bulan
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(event) =>
                                        setSelectedMonth(Number(event.target.value))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {uiPeriod === 'year' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tahun
                            </label>
                            <input
                                type="number"
                                min="2000"
                                max="2100"
                                value={selectedYear}
                                onChange={(event) =>
                                    setSelectedYear(Number(event.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                            />
                        </div>
                    )}

                    {uiPeriod === 'week' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tahun
                                </label>
                                <input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={selectedYear}
                                    onChange={(event) =>
                                        setSelectedYear(Number(event.target.value))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bulan
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(event) =>
                                        setSelectedMonth(Number(event.target.value))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Minggu
                                </label>
                                <select
                                    value={selectedWeek}
                                    onChange={(event) =>
                                        setSelectedWeek(Number(event.target.value))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-purple-600"
                                >
                                    {Array.from(
                                        { length: availableWeeks },
                                        (_, index) => index + 1,
                                    ).map((week) => (
                                        <option key={week} value={week}>
                                            Minggu ke-{week}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleApplyFilter}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Applying...' : 'Apply Filters'}
                    </button>
                </div>
            </div>
        </div>
    );
}
