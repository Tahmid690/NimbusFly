// src/component/AdminDashboard/components/Dashboard/OverviewTab.jsx
import React, { useState } from 'react';
import StatCard from './StatCard';
import RecentBookings from './RecentBookings';
import FlightOperations from './FlightOperations';
import { DollarSign, Navigation, Zap, Users, Clock, Download, ChevronDown } from 'lucide-react';

const OverviewTab = ({ analytics, bookings, flights, dataLoading, error, lastUpdated }) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
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

  const generateReportData = () => {
    return {
      analytics: {
        totalRevenue: analytics.totalRevenue || 0,
        totalFlights: analytics.totalFlights || 0,
        totalBookings: analytics.totalBookings || 0,
        totalPassengers: analytics.totalPassengers || 0,
        generatedAt: new Date().toISOString()
      },
      bookings: bookings || [],
      flights: flights || []
    };
  };

  const handleExport = (format) => {
    const reportData = generateReportData();
    const timestamp = new Date().toISOString().slice(0, 10);
    
    switch (format) {
      case 'csv-analytics':
        exportToCSV([reportData.analytics], `analytics-report-${timestamp}`);
        break;
      case 'csv-bookings':
        exportToCSV(reportData.bookings, `bookings-report-${timestamp}`);
        break;
      case 'csv-flights':
        exportToCSV(reportData.flights, `flights-report-${timestamp}`);
        break;
      case 'json-full':
        exportToJSON(reportData, `full-report-${timestamp}`);
        break;
      case 'json-analytics':
        exportToJSON(reportData.analytics, `analytics-report-${timestamp}`);
        break;
      default:
        exportToJSON(reportData, `dashboard-export-${timestamp}`);
    }
    setShowExportDropdown(false);
  };

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${analytics.totalRevenue ? analytics.totalRevenue.toLocaleString() : '0'}`, 
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Total earnings'
    },
    { 
      label: 'Total Flights', 
      value: analytics.totalFlights || '0', 
      icon: Navigation, 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All flights'
    },
    { 
      label: 'Total Bookings', 
      value: analytics.totalBookings || '0', 
      icon: Zap, 
      gradient: 'from-purple-500 to-pink-600',
      description: 'All reservations'
    },
    { 
      label: 'Total Passengers', 
      value: analytics.totalPassengers || '0', 
      icon: Users, 
      gradient: 'from-orange-500 to-red-600',
      description: 'All passengers'
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
          <div className="relative">
            <button 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Export Data</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">CSV Exports</div>
                  <button 
                    onClick={() => handleExport('csv-analytics')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Analytics Summary
                  </button>
                  <button 
                    onClick={() => handleExport('csv-bookings')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Bookings Data
                  </button>
                  <button 
                    onClick={() => handleExport('csv-flights')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Flights Data
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">JSON Exports</div>
                  <button 
                    onClick={() => handleExport('json-analytics')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Analytics Only
                  </button>
                  <button 
                    onClick={() => handleExport('json-full')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Complete Report
                  </button>
                </div>
              </div>
            )}
          </div>
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