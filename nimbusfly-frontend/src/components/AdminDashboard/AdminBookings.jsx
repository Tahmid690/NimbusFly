import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../Authnication/AdminContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;
import {
  Calendar,
  Users,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MapPin,
  Plane,
  User,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  DollarSign,
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';

const AdminBookings = () => {
  const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    pendingBookings: 0
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!adminLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, adminLoading, navigate]);

  // Fetch bookings data
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (admin?.airline_id) {
          const response = await axios.get(`${API_BASE}/admin/bookings/${admin.airline_id}`);
          if (response.data.success) {
            const bookingsData = response.data.data || [];
            setBookings(bookingsData);
            calculateStats(bookingsData);
          } else {
            setError('Failed to load bookings data');
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError(error.response?.data?.message || 'Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!adminLoading && admin && isAuthenticated) {
      fetchBookings();
    }
  }, [admin, isAuthenticated, adminLoading]);

  const calculateStats = (bookingsData) => {
    const totalBookings = bookingsData.length;
    const totalRevenue = bookingsData.reduce((sum, booking) => sum + (parseFloat(booking.total_amount) || 0), 0);
    const confirmedBookings = bookingsData.filter(booking => booking.payment_status?.toLowerCase() === 'confirmed').length;
    const pendingBookings = bookingsData.filter(booking => booking.payment_status?.toLowerCase() === 'pending').length;

    setStats({
      totalBookings,
      totalRevenue,
      confirmedBookings,
      pendingBookings
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const fetchBookingDetails = async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE}/bookings/${bookingId}/details`);
      if (response.data.success) {
        setSelectedBooking(response.data.data);
        setShowBookingDetails(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      alert('Failed to load booking details. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'cancelled': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeString;
    }
  };

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.booking_id?.toString().includes(searchTerm) ||
                         booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.routes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         booking.payment_status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      {/* Admin Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
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

            {/* Navigation and Controls */}
            <div className="flex items-center space-x-6">
              {/* Back to Dashboard */}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:block">Dashboard</span>
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

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

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
                    Bookings Management
                  </h1>
                  <p className="text-green-100 text-lg">
                    Monitor and manage all flight reservations for {admin.airline_name}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                    <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    <div className="text-xs opacity-90">Total Bookings</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                    <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                    <div className="text-xs opacity-90">Total Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            
            {/* Search and Filter Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-gray-900">All Bookings</h3>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h4>
                  <p className="text-gray-600 mb-8">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 hover:from-green-700 hover:via-green-800 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-12 h-12 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No matching bookings found' : 'No bookings yet'}
                  </h4>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms' : 'Bookings will appear here when customers make reservations'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              Booking #{booking.booking_id}
                            </h4>
                            <p className="text-gray-600">
                              {booking.customer_name} • {formatDate(booking.booking_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.payment_status)}`}>
                            {getStatusIcon(booking.payment_status)}
                            <span className="capitalize">{booking.payment_status}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ${parseFloat(booking.total_amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Customer:</span>
                            <span className="font-medium ml-1">{booking.customer_email}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Route:</span>
                            <span className="font-medium ml-1">{booking.routes || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Passengers:</span>
                            <span className="font-medium ml-1">{booking.total_passengers || 1}</span>
                          </div>
                        </div>
                      </div>

                      {booking.earliest_departure && (
                        <div className="bg-green-50 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-green-700 font-medium">Departure:</span>
                              <span className="ml-2">{formatDate(booking.earliest_departure)} at {formatTime(booking.earliest_departure)}</span>
                            </div>
                            {booking.latest_arrival && (
                              <div>
                                <span className="text-green-700 font-medium">Arrival:</span>
                                <span className="ml-2">{formatDate(booking.latest_arrival)} at {formatTime(booking.latest_arrival)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                        <div className="text-sm text-gray-500">
                          Trip Type: <span className="font-medium capitalize">{booking.trip_type || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => fetchBookingDetails(booking.booking_id)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Booking Details</h2>
                <p className="text-green-100">Booking #{selectedBooking.booking.booking_id}</p>
              </div>
              <button
                onClick={() => setShowBookingDetails(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Booking Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedBooking.booking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedBooking.booking.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-medium">{formatDate(selectedBooking.booking.booking_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-green-600">${parseFloat(selectedBooking.booking.total_amount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.booking.payment_status)}`}>
                      {getStatusIcon(selectedBooking.booking.payment_status)}
                      <span className="capitalize">{selectedBooking.booking.payment_status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trip Type</p>
                    <p className="font-medium capitalize">{selectedBooking.booking.trip_type}</p>
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Plane className="w-5 h-5 mr-2" />
                  Flight Details & Passengers
                </h3>
                <div className="space-y-4">
                  {selectedBooking.tickets && selectedBooking.tickets.length > 0 ? (
                    selectedBooking.tickets.map((ticket, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-white to-green-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Passenger</p>
                            <p className="font-medium">{ticket.passenger_first_name} {ticket.passenger_last_name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Flight</p>
                            <p className="font-medium">{ticket.flight_number}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Seat</p>
                            <p className="font-medium">{ticket.seat_number || 'Not assigned'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No ticket details available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Total Passengers: {selectedBooking.tickets ? selectedBooking.tickets.length : 0}
              </div>
              <button
                onClick={() => setShowBookingDetails(false)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;