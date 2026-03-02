export const getFormattedDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getMonthRange = (year, month) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return {
        start: getFormattedDate(start),
        end: getFormattedDate(end),
    };
};

export const getWeekRange = (year, month, week) => {
    const startDay = new Date(year, month - 1, 1 + (week - 1) * 7);
    const endDay = new Date(startDay);
    endDay.setDate(endDay.getDate() + 6);
    const monthEnd = new Date(year, month, 0);
    if (endDay > monthEnd) {
        endDay.setTime(monthEnd.getTime());
    }
    return {
        start: getFormattedDate(startDay),
        end: getFormattedDate(endDay),
    };
};

export const getYearRange = (year) => ({
    start: `${year}-01-01`,
    end: `${year}-12-31`,
});

export const weeksInMonth = (year, month) => {
    const days = new Date(year, month, 0).getDate();
    return Math.ceil(days / 7);
};

export const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

export const sanitizePhoneDigits = (value = '') => {
    return (value ?? '').replace(/\D/g, '');
};

export const stripPhoneNumber = (value = '') => {
    const digits = sanitizePhoneDigits(value);
    if (!digits) {
        return '';
    }

    if (digits.startsWith('0')) {
        return digits.slice(1);
    }

    if (digits.startsWith('62')) {
        return digits.slice(2);
    }

    return digits;
};

export const normalizePhoneNumber = (value = '') => {
    const digits = sanitizePhoneDigits(value);
    if (!digits) {
        return '';
    }

    let cleaned = digits;
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1);
    } else if (cleaned.startsWith('62')) {
        cleaned = cleaned.slice(2);
    }

    if (!cleaned) {
        return '';
    }

    return `+62${cleaned}`;
};

export const formatPhoneNumber = (value = '') => {
    const normalized = normalizePhoneNumber(value);
    if (!normalized) {
        return '';
    }

    const digits = normalized.slice(3);
    if (!digits) {
        return normalized;
    }

    const groups = [];
    let offset = 0;

    while (offset < digits.length) {
        const size = offset === 0 ? 3 : 4;
        groups.push(digits.slice(offset, offset + size));
        offset += size;
    }

    return `+62 ${groups.filter(Boolean).join('-')}`;
};
