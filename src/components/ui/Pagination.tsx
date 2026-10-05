/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaginationProps } from '../../types';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  id,
}: PaginationProps) {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav id={id} className="flex items-center justify-center space-x-1 py-4 font-sans select-none" aria-label="Pagination">
      {/* Prev Button */}
      <button
        id={`${id}-prev`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center h-10 w-10 text-brand-text border border-brand-accent hover:border-brand-secondary hover:text-brand-secondary disabled:opacity-30 disabled:hover:text-brand-text disabled:hover:border-brand-accent cursor-pointer disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Previous page"
      >
        <svg className="h-4 w-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Page Numbers */}
      {getPages().map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            id={`${id}-page-${page}`}
            onClick={() => onPageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            className={`h-10 w-10 text-xs font-semibold tracking-wider transition-all duration-300 border cursor-pointer ${
              isActive
                ? 'bg-brand-primary text-brand-bg border-brand-primary'
                : 'bg-brand-surface text-brand-text border-brand-accent hover:border-brand-secondary hover:text-brand-secondary'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        id={`${id}-next`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center h-10 w-10 text-brand-text border border-brand-accent hover:border-brand-secondary hover:text-brand-secondary disabled:opacity-30 disabled:hover:text-brand-text disabled:hover:border-brand-accent cursor-pointer disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Next page"
      >
        <svg className="h-4 w-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}
