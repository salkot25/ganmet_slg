import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook for Table Search, Sorting, Row Selection, and Pagination
 */
export function useTablePagination(data) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('TGLREMAJA');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Debounce search input for silky-smooth 60fps performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtered by Search & Sorted
  const processedData = useMemo(() => {
    let list = [...data];

    // Search Query
    const query = debouncedSearch.toLowerCase().trim();
    if (query) {
      list = list.filter(item => {
        return (
          String(item.IDPEL || '').toLowerCase().includes(query) ||
          String(item.NAMA || '').toLowerCase().includes(query) ||
          String(item.NO_METER_LAMA || '').toLowerCase().includes(query) ||
          String(item.NO_METER_BARU || '').toLowerCase().includes(query) ||
          String(item.TARIF || '').toLowerCase().includes(query) ||
          String(item.ALASAN_GANTI_METER || '').toLowerCase().includes(query) ||
          String(item.PETUGASREMAJA || '').toLowerCase().includes(query) ||
          String(item.UNITUP || '').toLowerCase().includes(query)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortColumn] || '';
      let valB = b[sortColumn] || '';

      if (sortColumn === 'TGLREMAJA') {
        const dateA = a._parsedDate || new Date(0);
        const dateB = b._parsedDate || new Date(0);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [data, debouncedSearch, sortColumn, sortDirection]);

  // Pagination calculations
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (safePage - 1) * pageSize;
    return processedData.slice(startIdx, startIdx + pageSize);
  }, [processedData, safePage, pageSize]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const setPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllCurrentPage = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allCurrentSelected = paginatedData.every(r => next.has(r._id));
      if (allCurrentSelected) {
        paginatedData.forEach(r => next.delete(r._id));
      } else {
        paginatedData.forEach(r => next.add(r._id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  return {
    searchTerm,
    setSearchTerm,
    sortColumn,
    sortDirection,
    handleSort,
    currentPage: safePage,
    totalPages,
    pageSize,
    setPageSize: (size) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    totalItems,
    paginatedData,
    processedData,
    setPage,
    selectedIds,
    toggleSelectRow,
    toggleSelectAllCurrentPage,
    clearSelection
  };
}
