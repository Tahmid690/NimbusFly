// src/component/AdminDashboard/components/Dashboard/RecentBookings.jsx
import React from 'react';
import GlowCard from '../UI/GlowCard';
import StatusBadge from '../UI/StatusBadge';
import { Calendar, Activity } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const RecentBookings = ({ bookings, dataLoading, error }) => (
  <GlowCard className="overflow-hidden">
    <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
            <p className="text-gray-500 text-sm">Latest passenger reservations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-green-500 text-sm font-medium">Live</span>
        </div>
      </div>
    </div>
    <div className="p-6">
      {dataLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Loading bookings...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500"><p>Error: {error}</p></div>
      ) : (
        <div className="space-y-4">
          {bookings.slice(0, 4).map((booking, index) => (
            <div key={booking.booking_id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {booking.customer_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{booking.customer_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500 truncate">{booking.routes || 'N/A'}</p>
                  <p className="text-xs text-gray-400">#{booking.booking_id} • {formatDate(booking.booking_date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-lg">${parseFloat(booking.total_amount || 0).toFixed(2)}</p>
                <StatusBadge status={booking.payment_status} />
              </div>
            </div>
          ))}
          {bookings.length === 0 && <div className="text-center py-8 text-gray-500"><Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No recent bookings</p></div>}
        </div>
      )}
    </div>
  </GlowCard>
);

export default RecentBookings;