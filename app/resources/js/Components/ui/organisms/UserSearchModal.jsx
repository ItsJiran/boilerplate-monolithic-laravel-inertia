import { useEffect, useState, useMemo } from 'react';
import Modal from '@/Components/Modal';
import InputGroup from '@/Components/ui/atoms/InputGroup';
import Button from '@/Components/ui/atoms/Button';
import TableWithPagination from '@/Components/ui/molecules/TableWithPagination';
import Heading from '@/Components/ui/atoms/Heading';
import Paragraph from '@/Components/ui/atoms/Paragraph';
import debounce from 'lodash/debounce';

export default function UserSearchModal({
    isOpen = false,
    onClose,
    onSelect,
    fetchUrl = '/activities/marketing-users',
    tenantId = null, // passed to filter by tenant
    title = 'Cari Marketing',
}) {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });

    const fetchUsers = async (searchTerm, pageNum) => {
        setLoading(true);
        try {
            const response = await window.axios.get(fetchUrl, {
                params: {
                    search: searchTerm,
                    page: pageNum,
                    tenant_id: tenantId ?? undefined,
                }
            });
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = useMemo(
        () => debounce((searchTerm, pageNum) => fetchUsers(searchTerm, pageNum), 300),
        [fetchUrl, tenantId]
    );

    useEffect(() => {
        if (isOpen) {
            debouncedFetch(search, page);
        }
        return () => debouncedFetch.cancel();
    }, [search, page, isOpen, fetchUrl, tenantId, debouncedFetch]);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setPage(1);
        }
    }, [isOpen]);

    const handleSelect = (user) => {
        onSelect(user);
        onClose();
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Heading size="lg">{title}</Heading>
                        <Paragraph className="mt-1">Cari marketing berdasarkan nama — hanya menampilkan user dengan role <strong>marketing</strong> di tenant ini atau global.</Paragraph>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <InputGroup
                        type="text"
                        placeholder="Ketik nama untuk mencari..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    )}
                    <TableWithPagination
                        headers={['Nama', 'Email', 'Aksi']}
                        items={data.data ?? []}
                        pagination={data}
                        onPageChange={(newPage) => setPage(newPage)}
                        emptyMessage={search ? 'Tidak ada marketing yang cocok.' : 'Belum ada data marketing untuk tenant ini.'}
                        renderRow={(user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{user.email ?? '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <Button size="sm" type="button" onClick={() => handleSelect(user)}>
                                        Pilih
                                    </Button>
                                </td>
                            </tr>
                        )}
                    />
                </div>
            </div>
        </Modal>
    );
}
