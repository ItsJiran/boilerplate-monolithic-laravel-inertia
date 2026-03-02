import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    getFormattedDate,
    getMonthRange,
    getWeekRange,
    getYearRange,
    weeksInMonth,
    months,
} from '@/Lib/utils';

const buildQueryString = (newParams) => {
    if (typeof window === 'undefined') {
        return { ...newParams };
    }

    const searchParams = new URLSearchParams(window.location.search);
    const currentParams = Object.fromEntries(searchParams.entries());
    return { ...currentParams, ...newParams };
};

export default function useFilters({ period, startDate, endDate }) {
    const currentDate = new Date();
    const defaultDate = startDate ? new Date(startDate) : currentDate;

    const [uiPeriod, setUiPeriod] = useState(period);
    const [uiStartDate, setUiStartDate] = useState(
        startDate || getFormattedDate(currentDate),
    );
    const [uiEndDate, setUiEndDate] = useState(
        endDate || getFormattedDate(currentDate),
    );

    const [selectedYear, setSelectedYear] = useState(defaultDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(defaultDate.getMonth() + 1);
    const [selectedWeek, setSelectedWeek] = useState(Math.ceil(defaultDate.getDate() / 7));

    const [isLoading, setIsLoading] = useState(false);

    const availableWeeks = useMemo(
        () => weeksInMonth(selectedYear, selectedMonth),
        [selectedYear, selectedMonth],
    );

    const updateQueryParams = (newParams = {}) => {
        if (typeof window === 'undefined') {
            return;
        }

        setIsLoading(true);
        const finalParams = buildQueryString(newParams);

        router.get(route('dashboard'), finalParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleApplyFilter = () => {
        let start;
        let end;

        if (uiPeriod === 'month') {
            const range = getMonthRange(selectedYear, selectedMonth);
            start = range.start;
            end = range.end;
        } else if (uiPeriod === 'week') {
            const validWeek = Math.min(selectedWeek, weeksInMonth(selectedYear, selectedMonth));
            const range = getWeekRange(selectedYear, selectedMonth, validWeek);
            start = range.start;
            end = range.end;
        } else if (uiPeriod === 'year') {
            const range = getYearRange(selectedYear);
            start = range.start;
            end = range.end;
        } else {
            start = uiStartDate;
            end = uiEndDate;
        }

        updateQueryParams({
            period: uiPeriod,
            start_date: start,
            end_date: end,
            page: 1,
        });
    };

    return {
        months,
        availableWeeks,
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
        isLoading,
        handleApplyFilter,
        updateQueryParams,
    };
}
