import clsx from 'clsx';
import Paragraph from '@/Components/ui/atoms/Paragraph';

function buildPageRange(currentPage, lastPage, maxLinks = 5) {
    if (lastPage <= 1) {
        return [];
    }

    const half = Math.floor(maxLinks / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(lastPage, start + maxLinks - 1);
    start = Math.max(1, end - maxLinks + 1);

    const pages = [];
    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    return pages;
}

export default function TableWithPagination({
    headers = [],
    items = [],
    renderRow,
    pagination = null,
    onPageChange = null,
    emptyMessage = 'No records found.',
}) {
    const currentPage = pagination?.current_page ?? 1;
    const lastPage = pagination?.last_page ?? 1;
    const total = pagination?.total ?? items.length;
    const from = pagination?.from ?? (items.length ? 1 : 0);
    const to = pagination?.to ?? items.length;
    const pages = buildPageRange(currentPage, lastPage);
    const canPaginate =
        pagination &&
        lastPage > 1 &&
        typeof onPageChange === 'function' &&
        pages.length > 0;

    const handleChangePage = (page) => {
        if (!canPaginate || page === currentPage || page < 1 || page > lastPage) {
            return;
        }

        onPageChange(page);
    };

    const showSummary = pagination && total > 0;

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="px-6 py-3"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-16 text-center">
                                    <Paragraph className="text-gray-500">
                                        {emptyMessage}
                                    </Paragraph>
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => renderRow(item, index))
                        )}
                    </tbody>
                </table>
            </div>

            {showSummary && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                    <span>
                        Showing {from} - {to} of {total} entries
                    </span>
                    {canPaginate && (
                        <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs">
                            <button
                                type="button"
                                onClick={() => handleChangePage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={clsx(
                                    'px-3 py-1 font-medium transition',
                                    currentPage === 1
                                        ? 'text-gray-300'
                                        : 'text-purple-600 hover:text-purple-800',
                                )}
                            >
                                Previous
                            </button>
                            {pages.map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => handleChangePage(page)}
                                    className={clsx(
                                        'px-3 py-1 font-medium transition',
                                        page === currentPage
                                            ? 'rounded-full bg-purple-600 text-white'
                                            : 'text-gray-600 hover:text-purple-700',
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => handleChangePage(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className={clsx(
                                    'px-3 py-1 font-medium transition',
                                    currentPage === lastPage
                                        ? 'text-gray-300'
                                        : 'text-purple-600 hover:text-purple-800',
                                )}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
