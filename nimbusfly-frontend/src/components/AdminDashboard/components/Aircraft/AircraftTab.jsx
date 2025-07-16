// src/component/AdminDashboard/components/Aircraft/AircraftTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import AircraftTable from './AircraftTable';
import StatCard from '../Dashboard/StatCard';
import { Plus, Plane, Wrench, AlertTriangle, Download, Filter, ChevronDown, X } from 'lucide-react';
import { useToast } from '../UI/Toast';
import axios from 'axios';

const AircraftTab = ({ allAircraft, admin }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showAddAircraftModal, setShowAddAircraftModal] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const aircraftPerPage = 15;
  const toast = useToast();

  // Calculate aircraft statistics
  const aircraftStats = useMemo(() => {
    if (!allAircraft.length) return {};
    
    const totalCapacity = allAircraft.reduce((sum, a) => sum + (a.capacity || 0), 0);
    
    return {
      totalAircraft: allAircraft.length,
      totalCapacity
    };
  }, [allAircraft]);

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.warning('No data to export');
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
      toast.warning('No data to export');
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
    
    switch (format) {
      case 'csv-aircraft':
        exportToCSV(allAircraft, `aircraft-data-${timestamp}`);
        break;
      case 'csv-stats':
        exportToCSV([aircraftStats], `aircraft-statistics-${timestamp}`);
        break;
      case 'json-aircraft':
        exportToJSON(allAircraft, `aircraft-data-${timestamp}`);
        break;
      case 'json-full':
        exportToJSON({
          statistics: aircraftStats,
          aircraft: allAircraft,
          exportedAt: new Date().toISOString()
        }, `aircraft-report-${timestamp}`);
        break;
      default:
        exportToJSON(allAircraft, `aircraft-export-${timestamp}`);
    }
    setShowExportDropdown(false);
  };

  const handleAddAircraft = () => {
    setShowAddAircraftModal(true);
  };

  const handleViewDetails = (aircraft) => {
    setSelectedAircraft(aircraft);
    setShowDetailsModal(true);
  };

  const handleEditAircraft = (aircraft) => {
    setSelectedAircraft(aircraft);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddAircraftModal(false);
    setShowDetailsModal(false);
    setShowEditModal(false);
    setSelectedAircraft(null);
  };

  const addAircraftDb = async (formData) => {
    if (!admin?.airline_id) {
      toast.error('Error: Airline ID not found. Please log in again.');
      return;
    }

    const aircraftData = {
      model: formData.get('model'),
      total_seats: parseInt(formData.get('total_seats')),
      econ_seats: parseInt(formData.get('econ_seats')),
      busi_seats: parseInt(formData.get('busi_seats')),
      airline_id: admin.airline_id,
      registration_number: formData.get('registration_number') || null,
      manufacturer: formData.get('manufacturer') || null,
      year_manufactured: formData.get('year_manufactured') ? parseInt(formData.get('year_manufactured')) : null,
      status: formData.get('status') || 'Active',
      max_range_km: formData.get('max_range_km') ? parseInt(formData.get('max_range_km')) : null
    };

    try {
      const response = await axios.post(
        'http://localhost:3000/aircraft/add',
        aircraftData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Aircraft ${aircraftData.model} created successfully! ✈️`);
        closeModals();
        // Store current tab in localStorage before reload
        localStorage.setItem('lastActiveTab', 'aircraft');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(`Failed to create aircraft: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error creating aircraft:', error);
      toast.error(`Error creating aircraft: ${error.response?.data?.error || error.message}`);
    }
  };

  const editAircraftDb = async (formData) => {
    if (!admin?.airline_id) {
      toast.error('Error: Airline ID not found. Please log in again.');
      return;
    }

    if (!selectedAircraft?.aircraft_id) {
      toast.error('Error: Aircraft ID not found.');
      return;
    }

    const aircraftData = {
      model: formData.get('model'),
      total_seats: parseInt(formData.get('total_seats')),
      econ_seats: parseInt(formData.get('econ_seats')),
      busi_seats: parseInt(formData.get('busi_seats')),
      airline_id: admin.airline_id,
      registration_number: formData.get('registration_number') || null,
      manufacturer: formData.get('manufacturer') || null,
      year_manufactured: formData.get('year_manufactured') ? parseInt(formData.get('year_manufactured')) : null,
      status: formData.get('status') || 'Active',
      max_range_km: formData.get('max_range_km') ? parseInt(formData.get('max_range_km')) : null
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/aircraft/update/${selectedAircraft.aircraft_id}`,
        aircraftData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      

      if (response.data.success) {
        toast.success(`Aircraft ${aircraftData.model} updated successfully! ✈️`);
        closeModals();
        // Store current tab in localStorage before reload
        localStorage.setItem('lastActiveTab', 'aircraft');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(`Failed to update aircraft: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error updating aircraft:', error);
      toast.error(`Error updating aircraft: ${error.response?.data?.error || error.message}`);
    }
  };

  const filteredAircraft = useMemo(() => {
    let filtered = allAircraft; 
    return filtered;
  }, [allAircraft]);


  const paginatedAircraft = useMemo(() => {
    const startIndex = (currentPage - 1) * aircraftPerPage;
    return filteredAircraft.slice(startIndex, startIndex + aircraftPerPage);
  }, [filteredAircraft, currentPage, aircraftPerPage]);

  const totalPages = Math.ceil(filteredAircraft.length / aircraftPerPage);

  const stats = [
    {
      label: 'Total Aircraft',
      value: aircraftStats.totalAircraft?.toLocaleString() || '0',
      icon: Plane,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Fleet size'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            Aircraft Management
          </h2>
          <p className="text-gray-600 text-lg">Fleet management and aircraft operations</p>
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
                    onClick={() => handleExport('csv-aircraft')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Aircraft Data
                  </button>
                  <button 
                    onClick={() => handleExport('csv-stats')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Aircraft Statistics
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">JSON Exports</div>
                  <button 
                    onClick={() => handleExport('json-aircraft')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Aircraft Data Only
                  </button>
                  <button 
                    onClick={() => handleExport('json-full')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Complete Aircraft Report
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleAddAircraft}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Add Aircraft</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>


      <GlowCard>
        <AircraftTable
          aircraft={paginatedAircraft}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={filteredAircraft.length}
          itemsPerPage={aircraftPerPage}
          onViewDetails={handleViewDetails}
          onEditAircraft={handleEditAircraft}
        />
      </GlowCard>

      {/* Add Aircraft Modal */}
      {showAddAircraftModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Aircraft</h3>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aircraft Model</label>
                  <input 
                    type="text" 
                    name="model"
                    placeholder="e.g., Boeing 737-800"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
                  <input 
                    type="number" 
                    name="total_seats"
                    placeholder="e.g., 180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Economy Seats</label>
                  <input 
                    type="number" 
                    name="econ_seats"
                    placeholder="e.g., 150"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Seats</label>
                  <input 
                    type="number" 
                    name="busi_seats"
                    placeholder="e.g., 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
               
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input 
                    type="text" 
                    name="registration_number"
                    placeholder="e.g., N12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                  <input 
                    type="text" 
                    name="manufacturer"
                    placeholder="e.g., Boeing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Manufactured</label>
                  <input 
                    type="number" 
                    name="year_manufactured"
                    placeholder="e.g., 2020"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Range (km)</label>
                  <input 
                    type="number" 
                    name="max_range_km"
                    placeholder="e.g., 5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={closeModals}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target.form);
                    addAircraftDb(formData);
                  }}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Add Aircraft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Aircraft Details Modal */}
      {showDetailsModal && selectedAircraft && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Aircraft Details</h3>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft ID</label>
                  <p className="text-lg font-semibold">#{selectedAircraft.aircraft_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <p className="text-lg font-semibold">{selectedAircraft.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
                  <p>{selectedAircraft.total_seats} seats</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Class Seats</label>
                  <p>{selectedAircraft.busi_seats} seats</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Economy Class Seats</label>
                  <p>{selectedAircraft.econ_seats} seats</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Airline ID</label>
                  <p>{selectedAircraft.airline_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <p>{selectedAircraft.registration_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <p>{selectedAircraft.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Manufactured</label>
                  <p>{selectedAircraft.year_manufactured || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="capitalize">{selectedAircraft.status || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Aircraft Modal */}
      {showEditModal && selectedAircraft && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Aircraft</h3>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aircraft Model</label>
                  <input 
                    type="text" 
                    name="model"
                    defaultValue={selectedAircraft.model}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
                  <input 
                    type="number" 
                    name="total_seats"
                    defaultValue={selectedAircraft.total_seats}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Economy Seats</label>
                  <input 
                    type="number" 
                    name="econ_seats"
                    defaultValue={selectedAircraft.econ_seats}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Seats</label>
                  <input 
                    type="number" 
                    name="busi_seats"
                    defaultValue={selectedAircraft.busi_seats}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input 
                    type="text" 
                    name="registration_number"
                    defaultValue={selectedAircraft.registration_number || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                  <input 
                    type="text" 
                    name="manufacturer"
                    defaultValue={selectedAircraft.manufacturer || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Manufactured</label>
                  <input 
                    type="number" 
                    name="year_manufactured"
                    defaultValue={selectedAircraft.year_manufactured || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    name="status"
                    defaultValue={selectedAircraft.status || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Range (km)</label>
                  <input 
                    type="number" 
                    name="max_range_km"
                    defaultValue={selectedAircraft.max_range_km || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={closeModals}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target.form);
                    editAircraftDb(formData);
                  }}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AircraftTab;