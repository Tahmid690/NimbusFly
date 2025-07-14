// src/component/AdminDashboard/components/Dashboard/FlightOperations.jsx
import React from 'react';
import GlowCard from '../UI/GlowCard';
import StatusBadge from '../UI/StatusBadge';
import { Plane, Globe, Navigation } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

const FlightOperations = ({ flights, dataLoading, error }) => (
  <GlowCard className="overflow-hidden">
    <div className="p-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Flight Operations</h3>
            <p className="text-gray-500 text-sm">Upcoming flights</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-blue-500 text-sm font-medium">Tracking</span>
        </div>
      </div>
    </div>
    <div className="p-6">
       {dataLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-500">Loading flights...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500"><p>Error: {error}</p></div>
      ) : (
      <div className="space-y-4">
        {flights.slice(0, 4).map((flight, index) => (
          <div key={flight.flight_id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{flight.flight_number}</p>
                <p className="text-sm text-gray-500">{flight.origin_code || 'N/A'} → {flight.destination_code || 'N/A'}</p>
                <p className="text-xs text-gray-400">{formatDate(flight.departure_time)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">{formatTime(flight.departure_time)} → {formatTime(flight.arrival_time)}</p>
              <div className="mt-1">
                <StatusBadge status={flight.status || 'Scheduled'} />
              </div>
            </div>
          </div>
        ))}
        {flights.length === 0 && <div className="text-center py-8 text-gray-500"><Plane className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No upcoming flights</p></div>}
      </div>
       )}
    </div>
  </GlowCard>
);

export default FlightOperations;