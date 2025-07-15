// src/component/AdminDashboard/components/UI/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, itemName = "items" }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => onPageChange(currentPage - 1);
  const handleNext = () => onPageChange(currentPage + 1);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const pageRange = 2; // Pages to show around current page
    console.log(totalPages);
    for (let i = 1; i <= totalPages; i++) {
      const isFirst = i === 1;
      const isLast = i === totalPages;
      const inRange = i >= currentPage - pageRange && i <= currentPage + pageRange;

      if (isFirst || isLast || inRange) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              i === currentPage
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {i}
          </button>
        );
      } else if (pageNumbers[pageNumbers.length - 1]?.key !== 'ellipsis-start' && i < currentPage) {
        pageNumbers.push(<span key="ellipsis-start" className="px-2 text-gray-400">...</span>);
      } else if (pageNumbers[pageNumbers.length - 1]?.key !== 'ellipsis-end' && i > currentPage) {
        pageNumbers.push(<span key="ellipsis-end" className="px-2 text-gray-400">...</span>);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between p-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} {itemName}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Previous
        </button>
        {renderPageNumbers()}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;