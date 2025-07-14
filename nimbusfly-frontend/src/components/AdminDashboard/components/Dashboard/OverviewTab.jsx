// src/component/AdminDashboard/components/Dashboard/OverviewTab.jsx
import React from 'react';
import StatCard from './StatCard';
import RecentBookings from './RecentBookings';
import FlightOperations from './FlightOperations';
import { DollarSign, Navigation, Zap, Users, Clock, Download } from 'lucide-react';

const OverviewTab = ({ analytics, bookings, flights, dataLoading, error, lastUpdated }) => {
  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${analytics.totalRevenue ? analytics.totalRevenue.toLocaleString() : '0'}`, 
      change: analytics.todayRevenue > 0 ? `+$${analytics.todayRevenue.toFixed(2)} today` : '$0 today', 
      trend: analytics.todayRevenue > 0 ? 'up' : 'neutral',
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Total earnings',
      percentage: analytics.todayRevenue && analytics.totalRevenue ? `+${((analytics.todayRevenue / analytics.totalRevenue) * 100).toFixed(1)}%` : '+0%'
    },
    { 
      label: 'Total Flights', 
      value: analytics.totalFlights || '0', 
      change: `${analytics.upcomingFlights || 0} upcoming`, 
      trend: analytics.upcomingFlights > 0 ? 'up' : 'neutral',
      icon: Navigation, 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All flights',
      percentage: analytics.upcomingFlights && analytics.totalFlights ? `${((analytics.upcomingFlights / analytics.totalFlights) * 100).toFixed(1)}%` : '0%'
    },
    { 
      label: 'Total Bookings', 
      value: analytics.totalBookings || '0', 
      change: `+${analytics.todayBookings || 0} today`, 
      trend: analytics.todayBookings > 0 ? 'up' : 'neutral',
      icon: Zap, 
      gradient: 'from-purple-500 to-pink-600',
      description: 'All reservations',
      percentage: analytics.todayBookings && analytics.totalBookings ? `+${((analytics.todayBookings / analytics.totalBookings) * 100).toFixed(1)}%` : '+0%'
    },
    { 
      label: 'Total Passengers', 
      value: analytics.totalPassengers || '0', 
      change: `${analytics.pendingBookings || 0} pending`, 
      trend: analytics.confirmedBookings > analytics.pendingBookings ? 'up' : 'neutral',
      icon: Users, 
      gradient: 'from-orange-500 to-red-600',
      description: 'All passengers',
      percentage: analytics.confirmedBookings && analytics.totalBookings ? `${((analytics.confirmedBookings / analytics.totalBookings) * 100).toFixed(1)}%` : '0%'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">Command Center</h2>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600 text-lg">Real-time aviation operations dashboard</p>
            {lastUpdated && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <button 
                onClick={() => alert('Exporting data...')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all duration-300"
            >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Export Data</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentBookings bookings={bookings} dataLoading={dataLoading} error={error} />
        <FlightOperations flights={flights} dataLoading={dataLoading} error={error} />
      </div>
    </div>
  );
};

export default OverviewTab;