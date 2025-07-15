// src/component/AdminDashboard/components/Bookings/BookingsTable.jsx
import React from 'react';
import { Eye, Edit3, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';
import Pagination from '../UI/Pagination';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const BookingsTable = ({ bookings, currentPage, onPageChange, totalPages, totalItems, itemsPerPage, searchQuery, onViewDetails, onUpdateStatus }) => (
  <div className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
          <tr>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Booking ID</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Route</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.booking_id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors duration-200">
              <td className="px-8 py-6">
                <span className="text-sm font-bold text-gray-900">#{booking.booking_id}</span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {booking.customer_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.customer_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{booking.customer_email}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 text-sm text-gray-600 font-medium">{booking.routes || 'N/A'}</td>
              <td className="px-8 py-6 text-sm text-gray-600 font-medium">{formatDate(booking.booking_date)}</td>
              <td className="px-8 py-6"><StatusBadge status={booking.payment_status} /></td>
              <td className="px-8 py-6 text-sm font-bold text-gray-900">${parseFloat(booking.total_amount || 0).toFixed(2)}</td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onViewDetails && onViewDetails(booking)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{searchQuery ? 'No bookings match your search' : 'No bookings available'}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <Pagination 
      currentPage={currentPage} 
      totalPages={totalPages} 
      onPageChange={onPageChange} 
      totalItems={totalItems} 
      itemsPerPage={itemsPerPage}
      itemName="bookings"
    />
  </div>
);

export default BookingsTable;