// src/component/AdminDashboard/components/Flights/FlightsTab.jsx
import { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import FlightsTable from './FlightsTable';
import StatCard from '../Dashboard/StatCard';
import { Plus, Navigation, Clock, AlertCircle, CheckCircle, Download, Filter } from 'lucide-react';

const FlightsTab = ({ allFlights }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const flightsPerPage = 20;

  // Calculate flight statistics
  const flightStats = useMemo(() => {
    if (!allFlights.length) return {};
    
    const now = new Date();
    const scheduled = allFlights.filter(f => f.flight_status === 'scheduled');
    const active = allFlights.filter(f => f.flight_status === 'active');
    const delayed = allFlights.filter(f => f.flight_status === 'delayed');
    const completed = allFlights.filter(f => f.flight_status === 'completed');
    const cancelled = allFlights.filter(f => f.flight_status === 'cancelled');
    const upcomingFlights = allFlights.filter(f => {
      const departureTime = new Date(f.departure_time);
      return departureTime > now;
    });
    
    return {
      totalFlights: allFlights.length,
      scheduled: scheduled.length,
      active: active.length,
      delayed: delayed.length,
      completed: completed.length,
      cancelled: cancelled.length,
      upcomingFlights: upcomingFlights.length,
      onTimeRate: ((scheduled.length + active.length + completed.length) / allFlights.length * 100).toFixed(1)
    };
  }, [allFlights]);

  const filteredFlights = useMemo(() => {
    let filtered = allFlights;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(flight => flight.flight_status === statusFilter);
    }
    
   
    
    return filtered;
  }, [allFlights, , statusFilter]);

  

  const paginatedFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * flightsPerPage;
    return filteredFlights.slice(startIndex, startIndex + flightsPerPage);
  }, [filteredFlights, currentPage, flightsPerPage]);

  const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

  const stats = [
    {
      label: 'Total Flights',
      value: flightStats.totalFlights?.toLocaleString() || '0',
      icon: Navigation,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All flights'
    },
    {
      label: 'Active',
      value: flightStats.active?.toLocaleString() || '0',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Active flights'
    },
    {
      label: 'Cancelled',
      value: flightStats.delayed?.toLocaleString() || '0',
      icon: Clock,
      gradient: 'from-red-500 to-red-700',
      description: 'Cancelled flights'
    },
    {
      label: 'Completed',
      value: flightStats.completed?.toLocaleString() || '0',
      icon: AlertCircle,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Completed flights'
    }
  ];

  return (
    <div className="relative space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            Flight Management
          </h2>
          <p className="text-gray-600 text-lg">Comprehensive flight operations control</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => alert('Exporting flight data...')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Export</span>
          </button>
          <button
            onClick={() => alert('Add flight functionality not implemented')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Add Flight</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Filter by Status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Flights</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="delayed">Delayed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-gray-600 text-sm">Showing {filteredFlights.length} of {allFlights.length} flights</span>
      </div>

      <GlowCard>
        <FlightsTable
          flights={paginatedFlights}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={filteredFlights.length}
          itemsPerPage={flightsPerPage}
        />
      </GlowCard>

    </div>
  );
};

export default FlightsTab;