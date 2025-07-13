import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './Authnication/AdminContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plane,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  ChevronDown,
  User,
  X
} from 'lucide-react';

const FlightManagement = ({ 
  flights = [], 
  onAddFlight, 
  onEditFlight, 
  onDeleteFlight, 
  onViewDetails,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  formatDate,
  formatTime,
  getStatusColor,
  getStatusIcon
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [flightForm, setFlightForm] = useState({
    flight_number: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    departure_date: '',
    arrival_date: '',
    aircraft_type: '',
    total_seats: '',
    available_seats: '',
    price: '',
    status: 'active'
  });
   const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
   const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Filter flights based on search term and status
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = !searchTerm || 
      flight.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || flight.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddFlight = (e) => {
    e.preventDefault();
    if (onAddFlight) {
      onAddFlight(flightForm);
    }
    setShowAddModal(false);
    setFlightForm({
      flight_number: '',
      origin: '',
      destination: '',
      departure_time: '',
      arrival_time: '',
      departure_date: '',
      arrival_date: '',
      aircraft_type: '',
      total_seats: '',
      available_seats: '',
      price: '',
      status: 'active'
    });
  };

  const handleDeleteFlight = (flightId, flightNumber) => {
    if (window.confirm(`Are you sure you want to delete flight ${flightNumber}?`)) {
      if (onDeleteFlight) {
        onDeleteFlight(flightId);
      }
    }
  };

    const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="space-y-6">

        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50">
                <div className="container mx-auto px-6 lg:px-8">
                  <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center space-x-4 group cursor-pointer">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img
                          src="/lgp.png"
                          alt="NimbusFly Logo"
                          className="h-12 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-3xl font-nunito font-bold text-blue-700 group-hover:text-blue-800 transition-all duration-300">
                          NimbusFly
                        </span>
                        <span className="text-xs text-blue-600 font-medium -mt-1">
                          Admin Portal
                        </span>
                      </div>
                    </div>
        
                    {/* Admin Controls */}
                    <div className="flex items-center space-x-6">
        
                      {/* Profile Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                          className="flex items-center space-x-3 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white"
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="hidden md:block">{admin.airline_name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showProfileDropdown && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <p className="text-sm font-semibold text-gray-900">{admin.airline_name}</p>
                              <p className="text-sm text-gray-600">{admin.email}</p>
                              <p className="text-xs text-blue-600 mt-1">Admin Access</p>
                            </div>
                            <div className="py-1">
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => {
                                  handleLogout();
                                  setShowProfileDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mt-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Flight Management</h2>
            <p className="text-gray-600">Manage your airline's flight schedules and operations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 lg:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Flight</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search flights by number, origin, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Flights</p>
                <p className="text-2xl font-bold text-blue-700">{flights.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Flights</p>
                <p className="text-2xl font-bold text-green-700">
                  {flights.filter(f => f.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Seats</p>
                <p className="text-2xl font-bold text-orange-700">
                  {flights.reduce((sum, f) => sum + (parseInt(f.total_seats) || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Available Seats</p>
                <p className="text-2xl font-bold text-purple-700">
                  {flights.reduce((sum, f) => sum + (parseInt(f.available_seats) || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flights Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left py-6 px-6 text-sm font-semibold text-gray-700">Flight Info</th>
                <th className="text-left py-6 px-6 text-sm font-semibold text-gray-700">Route</th>
                <th className="text-left py-6 px-6 text-sm font-semibold text-gray-700">Schedule</th>
                <th className="text-left py-6 px-6 text-sm font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-6 px-6 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-6 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-6 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Plane className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">No flights found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFlights.map((flight, index) => (
                  <tr key={flight.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <Plane className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{flight.flight_number}</p>
                          <p className="text-sm text-gray-500">{flight.aircraft_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{flight.origin}</p>
                          <p className="text-xs text-gray-500">Origin</p>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-8 h-px bg-gray-300 relative">
                            <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-gray-300 border-y-2 border-y-transparent transform -translate-y-1"></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{flight.destination}</p>
                          <p className="text-xs text-gray-500">Destination</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(flight.departure_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatTime(flight.departure_time)} - {formatTime(flight.arrival_time)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {flight.total_seats - flight.available_seats}/{flight.total_seats}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${((flight.total_seats - flight.available_seats) / flight.total_seats) * 100}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {flight.available_seats} seats available
                        </p>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">${flight.price}</p>
                        <p className="text-xs text-gray-500">per seat</p>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
                        {getStatusIcon(flight.status)}
                        <span className="capitalize">{flight.status}</span>
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewDetails && onViewDetails(flight)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditFlight && onEditFlight(flight)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Flight"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFlight(flight.id, flight.flight_number)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Flight"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Flight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[70]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Add New Flight</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddFlight} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    value={flightForm.flight_number}
                    onChange={(e) => setFlightForm({...flightForm, flight_number: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., AA123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aircraft Type *
                  </label>
                  <input
                    type="text"
                    value={flightForm.aircraft_type}
                    onChange={(e) => setFlightForm({...flightForm, aircraft_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Boeing 737"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin *
                  </label>
                  <input
                    type="text"
                    value={flightForm.origin}
                    onChange={(e) => setFlightForm({...flightForm, origin: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., DAC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={flightForm.destination}
                    onChange={(e) => setFlightForm({...flightForm, destination: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., NYC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date *
                  </label>
                  <input
                    type="date"
                    value={flightForm.departure_date}
                    onChange={(e) => setFlightForm({...flightForm, departure_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Date *
                  </label>
                  <input
                    type="date"
                    value={flightForm.arrival_date}
                    onChange={(e) => setFlightForm({...flightForm, arrival_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time *
                  </label>
                  <input
                    type="time"
                    value={flightForm.departure_time}
                    onChange={(e) => setFlightForm({...flightForm, departure_time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Time *
                  </label>
                  <input
                    type="time"
                    value={flightForm.arrival_time}
                    onChange={(e) => setFlightForm({...flightForm, arrival_time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    value={flightForm.total_seats}
                    onChange={(e) => setFlightForm({...flightForm, total_seats: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats *
                  </label>
                  <input
                    type="number"
                    value={flightForm.available_seats}
                    onChange={(e) => setFlightForm({...flightForm, available_seats: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150"
                    min="0"
                    max={flightForm.total_seats}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Seat *
                  </label>
                  <input
                    type="number"
                    value={flightForm.price}
                    onChange={(e) => setFlightForm({...flightForm, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="299"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={flightForm.status}
                    onChange={(e) => setFlightForm({...flightForm, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Add Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightManagement;