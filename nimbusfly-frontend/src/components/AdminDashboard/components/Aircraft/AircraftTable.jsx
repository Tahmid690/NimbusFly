// src/component/AdminDashboard/components/Aircraft/AircraftTable.jsx
import React from 'react';
import { Eye, Edit3, Navigation } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';
import Pagination from '../UI/Pagination';

const AircraftTable = ({ aircraft, currentPage, onPageChange, totalPages, totalItems, itemsPerPage, searchQuery, onViewDetails, onEditAircraft }) => (
  <div className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-cyan-50">
          <tr>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Aircraft ID</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Model</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total Capacity</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Business Class Seats</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Economy Class Seats</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {aircraft.map((plane) => (
            <tr key={plane.aircraft_id} className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-colors duration-200">
              <td className="px-8 py-6 font-medium text-gray-900">#{plane.aircraft_id}</td>
              <td className="px-8 py-6 text-gray-700">{plane.model}</td>
              <td className="px-8 py-6 text-gray-700">{plane.total_seats} seats</td>
              <td className="px-8 py-6 text-gray-700">{plane.busi_seats} seats</td>
              <td className="px-8 py-6 text-gray-700">{plane.econ_seats} seats</td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onViewDetails(plane)}
                    className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onEditAircraft(plane)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Aircraft"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {aircraft.length === 0 && (
            <tr>
              <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{searchQuery ? 'No aircraft match your search' : 'No aircraft available'}</p>
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
      itemName="aircraft"
    />
  </div>
);

export default AircraftTable;