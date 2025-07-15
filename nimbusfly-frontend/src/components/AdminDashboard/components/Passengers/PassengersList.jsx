// src/component/AdminDashboard/components/Passengers/PassengersList.jsx
import React from 'react';
import { Users } from 'lucide-react';
import Pagination from '../UI/Pagination';
// Remove date formatting import since we no longer show booking dates

const PassengersList = ({ passengers, currentPage, onPageChange, totalPages, totalItems, itemsPerPage, searchQuery }) => (
  
  <div className="space-y-4">
    <div className="space-y-4">
      {passengers.map((passenger) => {
        const firstName = passenger.first_name || '';
        const lastName = passenger.last_name || '';
        const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unknown Passenger';

        return (
          <div
            key={passenger.passenger_id}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{name}</p>
                 <p className="text-sm text-gray-500">Date of birth : {passenger.date_of_birth.toString().split('T')[0] }</p>
                <p className="text-sm text-gray-500">Passport number : {passenger.passport_number}</p>
                <p className="text-sm text-gray-500">Nationality : {passenger.nationality}</p>
              </div>
            </div>
            {/* You can add any right-side info here if needed */}
          </div>
        );
      })}

      {passengers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>
            {searchQuery
              ? 'No passengers match your search'
              : 'No passenger data available'}
          </p>
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
