// src/component/AdminDashboard/components/Passengers/PassengersList.jsx
import React from 'react';
import { Users } from 'lucide-react';
import Pagination from '../UI/Pagination';
import { formatDate } from '../../utils/formatters';

const PassengersList = ({ passengers, currentPage, onPageChange, totalPages, totalItems, itemsPerPage, searchQuery }) => (
  <div className="space-y-4">
    <div className="space-y-4">
      {passengers.map((booking, index) => (
        <div key={booking.booking_id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {booking.customer_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{booking.customer_name || 'Unknown Customer'}</p>
              <p className="text-sm text-gray-500">{booking.customer_email}</p>
              <p className="text-xs text-gray-400">Last flight: {booking.routes}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">{booking.total_passengers || 1} passenger(s)</p>
            <p className="text-xs text-gray-500">Booked on: {formatDate(booking.booking_date)}</p>
          </div>
        </div>
      ))}
      {passengers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{searchQuery ? 'No passengers match your search' : 'No passenger data available'}</p>
        </div>
      )}
    </div>
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      itemName="passengers"
    />
  </div>
);

export default PassengersList;