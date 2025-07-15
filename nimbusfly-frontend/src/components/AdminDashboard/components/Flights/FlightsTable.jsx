// src/component/AdminDashboard/components/Flights/FlightsTable.jsx
import React from 'react';
import { Eye, Edit3, Plane } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';
import Pagination from '../UI/Pagination';
import { formatDate, formatTime } from '../../utils/formatters';

const FlightsTable = ({ flights, currentPage, onPageChange, totalPages, totalItems, itemsPerPage }) => (
  <div className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
          <tr>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Flight</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Route</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Aircraft</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Schedule</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Capacity</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {flights.map((flight) => (
            <tr key={flight.flight_id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors duration-200">
              <td className="px-8 py-6">
                <span className="text-sm font-bold text-gray-900">{flight.flight_number}</span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{flight.origin_code}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm font-medium text-gray-900">{flight.destination_code}</span>
                </div>
              </td>
              <td className="px-8 py-6 text-sm text-gray-600 font-medium">{flight.aircraft_model || 'N/A'}</td>
              <td className="px-8 py-6">
                <div className="text-sm text-gray-600">
                  <p>{formatTime(flight.departure_time)} - {formatTime(flight.arrival_time)}</p>
                  <p className="text-xs text-gray-500">{formatDate(flight.departure_time)}</p>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{flight.total_seats - flight.available_seats}/{flight.total_seats}</span>
                  <p className="text-xs text-gray-500">{Math.round(((flight.total_seats - flight.available_seats) / flight.total_seats) * 100)}% full</p>
                </div>
              </td>
              <td className="px-8 py-6"><StatusBadge status={flight.status || 'Scheduled'} /></td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-5 h-5" /></button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Edit3 className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
          {flights.length === 0 && (
            <tr>
              <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{'No flights available'}</p>
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
      itemName="flights"
    />
  </div>
);

export default FlightsTable;