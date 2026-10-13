import { useState } from "react";

const PAGE_SIZE = 5;

export default function usePagination(items) {
  const [page, setPage] = useState(1);
  const pageSize = PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    page: currentPage,
    pageCount,
    pageItems: items.slice(startIndex, startIndex + pageSize),
    pageSize,
    rangeEnd: Math.min(startIndex + pageSize, items.length),
    rangeStart: items.length === 0 ? 0 : startIndex + 1,
    resetPage: () => setPage(1),
    setPage,
  };
}
