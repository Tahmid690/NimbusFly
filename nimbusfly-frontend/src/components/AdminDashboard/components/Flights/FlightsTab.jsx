// src/component/AdminDashboard/components/Flights/FlightsTab.jsx
import { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import FlightsTable from './FlightsTable';
import StatCard from '../Dashboard/StatCard';
import { Plus, Navigation, Clock, AlertCircle, CheckCircle, Download, Filter, ChevronDown, X } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';
import { formatDate, formatTime } from '../../utils/formatters';
import { useToast } from '../UI/Toast';
import ConfirmationModal from '../UI/ConfirmationModal';
import axios from 'axios';

const FlightsTab = ({ allFlights,admin }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [availableAircraft, setAvailableAircraft] = useState([]);
  const [availableAirports, setAvailableAirports] = useState([]);
  const [loadingAircraft, setLoadingAircraft] = useState(false);
  const [loadingAirports, setLoadingAirports] = useState(false);
  const flightsPerPage = 20;
  const toast = useToast();

  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [flightToCancel, setFlightToCancel] = useState(null);
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [editDepartureTime, setEditDepartureTime] = useState('');
  const [editArrivalTime, setEditArrivalTime] = useState('');

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

  const handleViewDetails = (flight) => {
    setSelectedFlight(flight);
    setShowDetailsModal(true);
  };

  const handleEditFlight = (flight) => {
    setSelectedFlight(flight);
    // Initialize edit modal time states
    const depTime = flight.departure_time ? new Date(flight.departure_time).toISOString().slice(0, 16) : '';
    const arrTime = flight.arrival_time ? new Date(flight.arrival_time).toISOString().slice(0, 16) : '';
    setEditDepartureTime(depTime);
    setEditArrivalTime(arrTime);
    setShowEditModal(true);
  };

  const handleAddFlight = () => {
    setShowAddFlightModal(true);
  };

  const handleStatusUpdate = (flightId, newStatus) => {
    console.log(`Updating flight ${flightId} status to ${newStatus}`);
    // TODO: Implement API call to update flight status
    toast.success(`Flight status updated to ${newStatus}`);
  };

  const handleCancelFlight = (flight) => {
    setFlightToCancel(flight);
    setShowCancelConfirmation(true);
  };

  const confirmCancelFlight = async () => {
    if (!flightToCancel) return;

    try {
      const response = await axios.put(
        `http://localhost:3000/flights/cancel/${flightToCancel.flight_id}`,
        { flight_status: 'Cancelled' },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Cancel response:', response.data);

      if (response.data.success) {
        toast.success(`Flight ${flightToCancel.flight_number} cancelled successfully! 🛫`);
        // Store current tab in localStorage before reload
        localStorage.setItem('lastActiveTab', 'flights');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(`Failed to cancel flight: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error cancelling flight:', error);
      toast.error(`Error cancelling flight: ${error.response?.data?.error || error.message}`);
    }
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowAddFlightModal(false);
    setSelectedFlight(null);
    setShowCancelConfirmation(false);
    setFlightToCancel(null);
    
    // Reset form fields when closing Add Flight modal
    setSelectedAircraft('');
    setSelectedOrigin('');
    setSelectedDestination('');
    setDepartureTime('');
    setArrivalTime('');
    setEditDepartureTime('');
    setEditArrivalTime('');
  };

  const addFlightDb = async (formData) => {
    if (!admin?.airline_id) {
      toast.error('Error: Airline ID not found. Please log in again.');
      return;
    }

    const flightData = {
      aircraft_id: parseInt(formData.get('aircraft_id')),
      origin_airport_id: parseInt(formData.get('origin_airport_id')),
      destination_airport_id: parseInt(formData.get('destination_airport_id')),
      departure_time: formData.get('departure_time'),
      arrival_time: formData.get('arrival_time'),
      business_ticket_price: parseFloat(formData.get('business_ticket_price')),
      economy_ticket_price: parseFloat(formData.get('economy_ticket_price')),
      round_trip_discount: formData.get('round_trip_discount') ? parseFloat(formData.get('round_trip_discount'))/100.0 : 0,
      baggage_limit: formData.get('baggage_limit') ? parseInt(formData.get('baggage_limit')) : null,
      airline_id: admin.airline_id,
      flight_status: 'Scheduled'
    };

    try {
      const response = await axios.post(
        'http://localhost:3000/flights/add',
        flightData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Flight created successfully! ✈️`);
        closeModals();
        // Store current tab in localStorage before reload
        localStorage.setItem('lastActiveTab', 'flights');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(`Failed to create flight: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error creating flight:', error);
      toast.error(`Error creating flight: ${error.response?.data?.error || error.message}`);
    }
  };

  const editFlightDb = async (formData) => {
    if (!admin?.airline_id) {
      toast.error('Error: Airline ID not found. Please log in again.');
      return;
    }
    console.log('Editing flight with data:', selectedFlight);

    if (!selectedFlight?.flight_id) {
      toast.error('Error: Flight ID not found.');
      return;
    }

    const flightData = {
      aircraft_id: parseInt(formData.get('aircraft_id')),
      departure_time: formData.get('departure_time'),
      arrival_time: formData.get('arrival_time')
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/flights/updt/${selectedFlight.flight_id}`,
        flightData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Flight updated successfully! ✈️`);
        closeModals();
        // Store current tab in localStorage before reload
        localStorage.setItem('lastActiveTab', 'flights');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(`Failed to update flight: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      toast.error(`Error updating flight: ${error.response?.data?.error || error.message}`);
    }
  };

  // Fetch available aircraft
  const fetchAvailableAircraft = async () => {
    if (!admin?.airline_id) return;
    
    setLoadingAircraft(true);
    try {
      const response = await axios.get(`http://localhost:3000/aircraft/airline/${admin.airline_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.data.success) {
        setAvailableAircraft(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching aircraft:', error);
      toast.error('Failed to load aircraft data');
    } finally {
      setLoadingAircraft(false);
    }
  };

  // Fetch available airports
  const fetchAvailableAirports = async () => {
    setLoadingAirports(true);
    try {
      const response = await axios.get('http://localhost:3000/airports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.data.success) {
        setAvailableAirports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching airports:', error);
      toast.error('Failed to load airport data');
    } finally {
      setLoadingAirports(false);
    }
  };

  // Load aircraft and airports when Add Flight modal opens
  useEffect(() => {
    if (showAddFlightModal && admin?.airline_id) {
      fetchAvailableAircraft();
      fetchAvailableAirports();
    }
  }, [showAddFlightModal, admin?.airline_id]);

  // Load aircraft when Edit Flight modal opens
  useEffect(() => {
    if (showEditModal && admin?.airline_id) {
      fetchAvailableAircraft();
    }
  }, [showEditModal, admin?.airline_id]);

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
            onClick={handleAddFlight}
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
          onViewDetails={handleViewDetails}
          onEditFlight={handleEditFlight}
          onStatusUpdate={handleStatusUpdate}
          onCancelFlight={handleCancelFlight}
        />
      </GlowCard>

      {/* Flight Details Modal */}
      {showDetailsModal && selectedFlight && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Flight Details</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                  <p className="text-lg font-semibold">{selectedFlight.flight_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <StatusBadge status={selectedFlight.flight_status || 'Scheduled'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <p>{selectedFlight.origin_code} - {selectedFlight.origin_city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <p>{selectedFlight.destination_code} - {selectedFlight.destination_city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                  <p>{formatDate(selectedFlight.departure_time)} at {formatTime(selectedFlight.departure_time)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival</label>
                  <p>{formatDate(selectedFlight.arrival_time)} at {formatTime(selectedFlight.arrival_time)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft</label>
                  <p>{selectedFlight.aircraft_model || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <p>{selectedFlight.aircraft_capacity} seats</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats</label>
                  <p>{selectedFlight.available_seats}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy</label>
                  <p>{Math.round(((selectedFlight.aircraft_capacity - selectedFlight.available_seats) / selectedFlight.aircraft_capacity) * 100)}% full</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Edit Modal */}
      {showEditModal && selectedFlight && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Flight</h3>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft</label>
                  <select 
                    name="aircraft_id"
                    defaultValue={selectedFlight.aircraft_id || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loadingAircraft}
                  >
                    <option value="">Select aircraft</option>
                    {availableAircraft && availableAircraft.map((aircraft) => (
                      <option key={aircraft.aircraft_id} value={aircraft.aircraft_id}>
                        {aircraft.model} - {aircraft.registration_number || `ID: ${aircraft.aircraft_id}`} 
                        ({aircraft.total_seats} seats)
                      </option>
                    ))}
                  </select>
                </div>
                
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                  <input 
                    type="datetime-local" 
                    name="departure_time"
                    value={editDepartureTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => {
                      setEditDepartureTime(e.target.value);
                      // Clear arrival time if it's earlier than the new departure time
                      if (editArrivalTime && e.target.value && new Date(e.target.value) >= new Date(editArrivalTime)) {
                        setEditArrivalTime('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                 
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                  <input 
                    type="datetime-local" 
                    name="arrival_time"
                    value={editArrivalTime}
                    onChange={(e) => setEditArrivalTime(e.target.value)}
                    min={editDepartureTime}
                    disabled={!editDepartureTime}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editDepartureTime ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    required
                  />
                  {!editDepartureTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please select departure time first
                    </p>
                  )}
                  
                </div>
                
                
              </div>
              
              <div className="flex justify-end space-x-4 pt-6">
                <button 
                  onClick={closeModals}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    
                    if (!editDepartureTime || !editArrivalTime) {
                      toast.warning('Please select both departure and arrival times');
                      return;
                    }
                    
                    if (new Date(editDepartureTime) >= new Date(editArrivalTime)) {
                      toast.error('Arrival time must be after departure time');
                      return;
                    }
                    
                    const formData = new FormData(e.target.form);
                    editFlightDb(formData);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Flight Modal */}
      {showAddFlightModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Flight</h3>
              <button 
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aircraft</label>
                  <select 
                    name="aircraft_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loadingAircraft}
                    value={selectedAircraft}
                    onChange={(e) => setSelectedAircraft(e.target.value)}
                  >
                    <option value="">
                       Select aircraft
                    </option>
                    {availableAircraft && availableAircraft.map((aircraft) => (
                      <option key={aircraft.aircraft_id} value={aircraft.aircraft_id}>
                        {aircraft.model} - {aircraft.registration_number || `ID: ${aircraft.aircraft_id}`} 
                        ({aircraft.total_seats} seats)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origin Airport</label>
                  <select 
                    name="origin_airport_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loadingAirports}
                    value={selectedOrigin}
                    onChange={(e) => {
                      const newOrigin = e.target.value;
                      setSelectedOrigin(newOrigin);
                      // Clear destination if it's the same as the new origin
                      if (String(newOrigin) === String(selectedDestination)) {
                        setSelectedDestination('');
                      }
                    }}
                  >
                    <option value="">
                       Select origin airport
                    </option>
                    {availableAirports && availableAirports
                      .filter(airport => {
                        // Convert both to strings for comparison to avoid type issues
                        const airportId = String(airport.airport_id);
                        const selectedDestinationId = String(selectedDestination);
                        return airportId !== selectedDestinationId;
                      })
                      .map((airport) => (
                      <option key={airport.airport_id} value={airport.airport_id}>
                        {airport.iata_code} - {airport.airport_name} ({airport.city}, {airport.country})
                      </option>
                    ))}
                  </select>
                  
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination Airport</label>
                  <select 
                    name="destination_airport_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loadingAirports}
                    value={selectedDestination}
                    onChange={(e) => {
                      const newDestination = e.target.value;
                      setSelectedDestination(newDestination);
                      // Clear origin if it's the same as the new destination
                      if (String(newDestination) === String(selectedOrigin)) {
                        setSelectedOrigin('');
                      }
                    }}
                  >
                    <option value="">
                       Select destination airport
                    </option>
                    {availableAirports && availableAirports
                      .filter(airport => {
                        // Convert both to strings for comparison to avoid type issues
                        const airportId = String(airport.airport_id);
                        const selectedOriginId = String(selectedOrigin);
                        return airportId !== selectedOriginId;
                      })
                      .map((airport) => (
                      <option key={airport.airport_id} value={airport.airport_id}>
                        {airport.iata_code} - {airport.airport_name} ({airport.city}, {airport.country})
                      </option>
                    ))}
                  </select>
                  
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                  <input 
                    type="datetime-local" 
                    name="departure_time"
                    value={departureTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => {
                      setDepartureTime(e.target.value);
                      // Clear arrival time if it's earlier than the new departure time
                      if (arrivalTime && e.target.value && new Date(e.target.value) >= new Date(arrivalTime)) {
                        setArrivalTime('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                 
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                  <input 
                    type="datetime-local" 
                    name="arrival_time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    min={departureTime}
                    disabled={!departureTime}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !departureTime ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    required
                  />
                  {!departureTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please select departure time first
                    </p>
                  )}
                  
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Ticket Price ($)</label>
                  <input 
                    type="number" 
                    name="business_ticket_price"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Economy Ticket Price ($)</label>
                  <input 
                    type="number" 
                    name="economy_ticket_price"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Round Trip Discount (%)</label>
                  <input 
                    type="number" 
                    name="round_trip_discount"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                 
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Baggage Limit (kg)</label>
                  <input 
                    type="number" 
                    name="baggage_limit"
                    placeholder="e.g., 23"
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
                    
                    // Validate that origin and destination are different
                    if (String(selectedOrigin) === String(selectedDestination)) {
                      toast.error('Origin and destination airports cannot be the same!');
                      return;
                    }
                    
                    if (!selectedOrigin || !selectedDestination) {
                      toast.warning('Please select both origin and destination airports');
                      return;
                    }
                    
                    if (!selectedAircraft) {
                      toast.warning('Please select an aircraft');
                      return;
                    }
                    
                    if (!departureTime || !arrivalTime) {
                      toast.warning('Please select both departure and arrival times');
                      return;
                    }
                    
                    if (new Date(departureTime) >= new Date(arrivalTime)) {
                      toast.error('Arrival time must be after departure time');
                      return;
                    }
                    
                    const formData = new FormData(e.target.form);
                    const roundTripDiscount = parseFloat(formData.get('round_trip_discount') || 0);
                    
                    if (roundTripDiscount > 100) {
                      toast.error('Round trip discount cannot exceed 100%');
                      return;
                    }
                    
                    if (roundTripDiscount < 0) {
                      toast.error('Round trip discount cannot be negative');
                      return;
                    }
                    
                    addFlightDb(formData);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Flight Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={confirmCancelFlight}
        title="Cancel Flight"
        message={`Are you sure you want to cancel flight ${flightToCancel?.flight_number}? This action cannot be undone.`}
        confirmText="Cancel Flight"
        cancelText="Keep Flight"
        type="danger"
      />

    </div>
  );
};

export default FlightsTab;