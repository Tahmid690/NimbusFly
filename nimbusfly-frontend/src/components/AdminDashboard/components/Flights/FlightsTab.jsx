// src/component/AdminDashboard/components/Flights/FlightsTab.jsx
import { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import FlightsTable from './FlightsTable';
import StatCard from '../Dashboard/StatCard';
import { Plus, Navigation, Clock, AlertCircle, CheckCircle, Download, Filter, ChevronDown } from 'lucide-react';

const FlightsTab = ({ allFlights }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const flightsPerPage = 20;

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value || '';
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data, filename) => {
    if (!data) {
      alert('No data to export');
      return;
    }
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const dataToExport = statusFilter === 'all' ? allFlights : filteredFlights;
    
    switch (format) {
      case 'csv-flights':
        exportToCSV(dataToExport, `flights-${statusFilter}-${timestamp}`);
        break;
      case 'csv-stats':
        exportToCSV([flightStats], `flight-statistics-${timestamp}`);
        break;
      case 'json-flights':
        exportToJSON(dataToExport, `flights-${statusFilter}-${timestamp}`);
        break;
      case 'json-full':
        exportToJSON({
          statistics: flightStats,
          flights: dataToExport,
          filters: { status: statusFilter },
          exportedAt: new Date().toISOString()
        }, `flight-report-${timestamp}`);
        break;
      default:
        exportToJSON(dataToExport, `flights-export-${timestamp}`);
    }
    setShowExportDropdown(false);
  };
  // console.log('All Flights:', allFlights);
  // Calculate flight statistics
  const flightStats = useMemo(() => {
    if (!allFlights.length) return {};
    
    const now = new Date();
    const scheduled = allFlights.filter(f => f.flight_status === 'Scheduled');
    const active = allFlights.filter(f => f.flight_status === 'Active');
    const completed = allFlights.filter(f => f.flight_status === 'Completed');
    const cancelled = allFlights.filter(f => f.flight_status === 'Cancelled');
    const upcomingFlights = allFlights.filter(f => {
      const departureTime = new Date(f.departure_time);
      return departureTime > now;
    });
    
    return {
      totalFlights: allFlights.length,
      scheduled: scheduled.length,
      active: active.length,
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
      console.log('Applying status filter:', statusFilter);
      filtered = filtered.filter(flight => flight.flight_status === statusFilter);
    }

    console.log('Filtered Flights:', filtered);
    
   
    
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
      value: flightStats.cancelled?.toLocaleString() || '0',
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
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Export</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">CSV Exports</div>
                  <button 
                    onClick={() => handleExport('csv-flights')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Flight Data ({statusFilter === 'all' ? 'All' : statusFilter})
                  </button>
                  <button 
                    onClick={() => handleExport('csv-stats')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Flight Statistics
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">JSON Exports</div>
                  <button 
                    onClick={() => handleExport('json-flights')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Flight Data Only
                  </button>
                  <button 
                    onClick={() => handleExport('json-full')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Complete Flight Report
                  </button>
                </div>
              </div>
            )}
          </div>
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
          <option value="Scheduled">Scheduled</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
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