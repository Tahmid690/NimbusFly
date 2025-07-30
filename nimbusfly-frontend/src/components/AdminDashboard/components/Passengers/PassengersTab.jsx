// src/component/AdminDashboard/components/Passengers/PassengersTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import PassengersList from './PassengersList';
import StatCard from '../Dashboard/StatCard';
import { useAdminAuth } from '../../../Authnication/AdminContext'; 
import axios from 'axios';
import { Users, UserCheck, UserX, Clock, Download, Filter, ChevronDown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const PassengersTab = ({ allBookings, searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [allpassengers,setPassengers]=useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const passengersPerPage = 15;
  const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
  console.log(admin);
 // console.log("All bookings : ",allBookings);
  // Calculate passenger statistics

  // Export functions
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

  const passengerStats = useMemo(() => {
    if (!allpassengers.length) return {};
    
    return {
      totalPassengers: allpassengers.length,
      avgAge: allpassengers.reduce((sum, p) => sum + (p.age || 0), 0) / allpassengers.length,
      nationalities: [...new Set(allpassengers.map(p => p.nationality))].length
    };
  }, [allpassengers]);

  const handleExport = (format) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    
    switch (format) {
      case 'csv-passengers':
        exportToCSV(allpassengers, `passengers-data-${timestamp}`);
        break;
      case 'csv-stats':
        exportToCSV([passengerStats], `passenger-statistics-${timestamp}`);
        break;
      case 'json-passengers':
        exportToJSON(allpassengers, `passengers-data-${timestamp}`);
        break;
      case 'json-full':
        exportToJSON({
          statistics: passengerStats,
          passengers: allpassengers,
          exportedAt: new Date().toISOString()
        }, `passenger-report-${timestamp}`);
        break;
      default:
        exportToJSON(allpassengers, `passengers-export-${timestamp}`);
    }
    setShowExportDropdown(false);
  };

      useEffect(() => {
  if (!admin?.airline_id) return;         // wait until we have an airline ID

  const fetchPassengers = async () => {
    try {
      const  response  = await axios.get(
        `${API_BASE}/admin/getpassenger/${admin.airline_id}`, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      setPassengers(response.data.data); 
     console.log(response.data.data);                // use the JSON payload
    } catch (err) {
      console.error('Failed to load passengers', err);
    }
  };

  fetchPassengers();
}, [admin.airline_id]); 




  // Passengers are derived from the bookings list


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedPassengers = useMemo(() => {
    const startIndex = (currentPage - 1) * passengersPerPage;
    return allpassengers.slice(startIndex, startIndex + passengersPerPage);
  }, [allpassengers, currentPage, passengersPerPage]);

  const totalPages = Math.ceil(allpassengers.length / passengersPerPage);

  const stats = [
    {
      label: 'Total Passengers',
      value: allpassengers.length.toLocaleString() || '0',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Unique customers',
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            Passenger Management
          </h2>
          <p className="text-gray-600 text-lg">Customer database and analytics</p>
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
                    onClick={() => handleExport('csv-passengers')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Passenger Data
                  </button>
                  <button 
                    onClick={() => handleExport('csv-stats')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Passenger Statistics
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">JSON Exports</div>
                  <button 
                    onClick={() => handleExport('json-passengers')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Passenger Data Only
                  </button>
                  <button 
                    onClick={() => handleExport('json-full')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Complete Passenger Report
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

      <GlowCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">All Passengers</h3>
        <PassengersList
          passengers={paginatedPassengers}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={allpassengers.length}
          itemsPerPage={passengersPerPage}
          searchQuery={searchQuery}
        />
      </GlowCard>
    </div>
  );
};

export default PassengersTab;