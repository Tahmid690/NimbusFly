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
  User
} from 'lucide-react';

const AdminDashboard = () => {
  const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    airline_name: '',
    email: ''
  });
  const [airlineLogo, setAirlineLogo] = useState(null);

  // Redirect if not authenticated (only after adminLoading is complete)
  useEffect(() => {
    if (!adminLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to admin login');
      navigate('/admin/login');
    }
  }, [isAuthenticated, adminLoading, navigate]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        
        console.log('fetchAdminData called with admin:', admin);
        console.log('fetchAdminData - admin.airline_id:', admin?.airline_id);

        setDataLoading(true);
        if (admin?.airline_id) {
          console.log('Admin has airline_id, fetching airline details...');
          // Fetch airline details including logo
          try {
            console.log('Making API call to:', `http://localhost:3000/airlines/${admin.airline_id}`);
            const airlineResponse = await axios.get(`http://localhost:3000/airlines/${admin.airline_id}`);
            console.log('Airline response:', airlineResponse.data);
            if (airlineResponse.data && airlineResponse.data.success && airlineResponse.data.data && airlineResponse.data.data.logo_url) {
              setAirlineLogo(airlineResponse.data.data.logo_url);
              console.log('Set airline logo:', airlineResponse.data.data.logo_url);
            } else {
              console.log('No logo_url found in response');
            }
          } catch (airlineError) {
            console.log('Airline details API not available:', airlineError);
          }
        } else {
          console.log('No airline_id found in admin object');
        }

        if (admin?.airline_id) {
          // Try to fetch flights for this airline
          try {
            const flightsResponse = await axios.get(`http://localhost:3000/admin/flights/${admin.airline_id}`);
            if (flightsResponse.data.success) {
              setFlights(flightsResponse.data.data || []);
            }
          } catch (flightError) {
            console.log('Flights API not available, using empty array');
            setFlights([]);
          }

          // Try to fetch bookings for this airline
          try {
            const bookingsResponse = await axios.get(`http://localhost:3000/admin/bookings/${admin.airline_id}`);
            if (bookingsResponse.data.success) {
              setBookings(bookingsResponse.data.data || []);
            }
          } catch (bookingError) {
            console.log('Bookings API not available, using empty array');
            setBookings([]);
          }

          // Calculate analytics will be called after state updates
        }
      } catch (error) {
        console.error('Error in fetchAdminData:', error);
        // Set empty arrays as fallback
        setFlights([]);
        setBookings([]);
      } finally {
        setDataLoading(false);
      }
    };

    console.log('AdminDashboard useEffect - admin:', admin);
    console.log('AdminDashboard useEffect - admin keys:', admin ? Object.keys(admin) : 'no admin');
    console.log('AdminDashboard useEffect - admin.airline_id:', admin?.airline_id);
    console.log('AdminDashboard useEffect - admin.id:', admin?.id);
    console.log('AdminDashboard useEffect - isAuthenticated:', isAuthenticated);
    console.log('AdminDashboard useEffect - adminLoading:', adminLoading);
    
    // Only proceed if adminLoading is complete
    if (!adminLoading) {
      if (admin && isAuthenticated) {
        console.log('Admin data available, fetching admin data...');
        console.log('Admin airline_id before fetch:', admin.airline_id);
        fetchAdminData();
      } else {
        console.log('No admin data or not authenticated, stopping data loading...');
        setDataLoading(false);
      }
    }
  }, [admin, isAuthenticated, adminLoading]);

  // Calculate analytics when flights or bookings data changes
  useEffect(() => {
    calculateAnalytics(flights, bookings);
  }, [flights, bookings]);

  const calculateAnalytics = (flightData, bookingData) => {
    const totalFlights = flightData.length;
    const totalBookings = bookingData.length;
    const totalRevenue = bookingData.reduce((sum, booking) => sum + (parseFloat(booking.total_amount) || 0), 0);
    const avgOccupancy = flightData.length > 0 ? 
      flightData.reduce((sum, flight) => sum + ((flight.total_seats - flight.available_seats) / flight.total_seats * 100), 0) / flightData.length : 0;

    setAnalytics({
      totalFlights,
      totalBookings,
      totalRevenue,
      avgOccupancy: avgOccupancy.toFixed(1)
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleEditProfile = () => {
    setProfileForm({
      airline_name: admin.airline_name || '',
      email: admin.email || ''
    });
    setShowEditProfile(true);
    setShowProfileDropdown(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would call an API to update admin profile
      console.log('Update admin profile:', profileForm);
      alert('Profile updated successfully!');
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Helper function to get airline logo based on airline name
  const getAirlineLogo = (airlineName) => {
    if (!airlineName) return '/nimbusfly_logo.png';
    
    const airline = airlineName.toLowerCase();
    
    // Map airline names to their logo files
    if (airline.includes('american')) return '/aa.jpeg';
    if (airline.includes('british')) return '/ba.png';
    if (airline.includes('biman')) return '/bba.png';
    if (airline.includes('us bangla')) return '/usba.png';
    if (airline.includes('saudi')) return '/saa.png';
    if (airline.includes('novoair')) return '/na.png';
    
    // Default fallback logo
    return '/nimbusfly_logo.png';
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'cancelled':
      case 'inactive':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Show loading while AdminContext is loading
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

  // If not authenticated, the useEffect will handle redirect
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
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{admin.airline_name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:block">{admin.email}</span>
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
                        onClick={handleEditProfile}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8 mt-20">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-8 py-16 text-center relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="w-32 h-32 bg-white rounded-full p-4 shadow-2xl mx-auto mb-8">
                  {airlineLogo ? (
                    <img 
                      src={airlineLogo} 
                      alt={`${admin.airline_name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.log('Failed to load airline logo, using fallback');
                        e.target.src = getAirlineLogo(admin.airline_name);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {admin.airline_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  Welcome {admin.airline_name}
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Take control of your airline operations with our comprehensive management system. 
                  Monitor flights, track bookings, analyze performance, and manage your airline efficiently.
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">System Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => setActiveTab('flights')}
                className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <Plane className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Flight Management</h3>
                  <p className="text-sm text-gray-600">Manage schedules, routes, and aircraft</p>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab('bookings')}
                className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Bookings</h3>
                  <p className="text-sm text-gray-600">View and manage reservations</p>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab('analytics')}
                className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">View reports and insights</p>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab('settings')}
                className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
                  <p className="text-sm text-gray-600">Configuration and preferences</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Airline Name
                </label>
                <input
                  type="text"
                  value={profileForm.airline_name}
                  onChange={(e) => setProfileForm({...profileForm, airline_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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

export default AdminDashboard;