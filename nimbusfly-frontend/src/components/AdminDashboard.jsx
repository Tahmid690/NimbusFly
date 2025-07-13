import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './Authnication/AdminContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  Plane, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Filter,
  Download,
  Edit3,
  Eye,
  Settings,
  BarChart3,
  Globe,
  Zap,
  Shield,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Layers,
  Navigation,
  Wifi,
  Battery,
  Signal,
  LogOut,
  ChevronDown,
  Plus,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Pagination states
  const [currentFlightPage, setCurrentFlightPage] = useState(1);
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [currentPassengerPage, setCurrentPassengerPage] = useState(1);
  const [currentAircraftPage, setCurrentAircraftPage] = useState(1);
  const [flightsPerPage] = useState(20);
  const [bookingsPerPage] = useState(20);
  const [passengersPerPage] = useState(20);
  const [aircraftPerPage] = useState(20);
  
  // Data states
  const [dataLoading, setDataLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [airlineLogo, setAirlineLogo] = useState(null);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!adminLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, adminLoading, navigate]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setDataLoading(true);
        if (admin?.airline_id) {
          // Fetch airline details including logo
          try {
            const airlineResponse = await axios.get(`http://localhost:3000/airlines/${admin.airline_id}`);
            if (airlineResponse.data && airlineResponse.data.success && airlineResponse.data.data && airlineResponse.data.data.logo_url) {
              setAirlineLogo(airlineResponse.data.data.logo_url);
            }
          } catch (airlineError) {
            console.log('Airline details API not available:', airlineError);
          }

          // Fetch analytics data
          try {
            const analyticsResponse = await axios.get(`http://localhost:3000/admin/analytics/${admin.airline_id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
              }
            });
            if (analyticsResponse.data.success) {
              setAnalytics(analyticsResponse.data.data.stats || {});
              setBookings(analyticsResponse.data.data.recentBookings || []);
              setFlights(analyticsResponse.data.data.upcomingFlights || []);
            }
          } catch (analyticsError) {
            console.log('Analytics API error:', analyticsError);
            // Fallback to individual endpoints
            await fetchIndividualData();
          }
        }
      } catch (error) {
        console.error('Error in fetchAdminData:', error);
        setFlights([]);
        setBookings([]);
        setAnalytics({});
      } finally {
        setDataLoading(false);
      }
    };

    const fetchIndividualData = async () => {
      try {
        // Fetch flights
        const flightsResponse = await axios.get(`http://localhost:3000/admin/flights/${admin.airline_id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        if (flightsResponse.data.success) {
          setFlights(flightsResponse.data.data || []);
        }

        // Fetch bookings
        const bookingsResponse = await axios.get(`http://localhost:3000/admin/bookings/${admin.airline_id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        if (bookingsResponse.data.success) {
          setBookings(bookingsResponse.data.data || []);
          // Calculate basic analytics from bookings
          const bookingData = bookingsResponse.data.data || [];
          const basicAnalytics = {
            totalBookings: bookingData.length,
            totalRevenue: bookingData.reduce((sum, booking) => sum + (parseFloat(booking.total_amount) || 0), 0),
            confirmedBookings: bookingData.filter(booking => booking.payment_status?.toLowerCase() === 'confirmed').length,
            pendingBookings: bookingData.filter(booking => booking.payment_status?.toLowerCase() === 'pending').length
          };
          setAnalytics(basicAnalytics);
        }
      } catch (error) {
        console.error('Error fetching individual data:', error);
        setFlights([]);
        setBookings([]);
        setAnalytics({});
      }
    };

    const refreshData = async () => {
      try {
        const analyticsResponse = await axios.get(`http://localhost:3000/admin/analytics/${admin.airline_id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (analyticsResponse.data.success) {
          setAnalytics(analyticsResponse.data.data.stats || {});
          setBookings(analyticsResponse.data.data.recentBookings || []);
          setFlights(analyticsResponse.data.data.upcomingFlights || []);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (error) {
        console.error('Refresh failed:', error);
        setError('Failed to refresh data');
      }
    };

    if (!adminLoading && admin && isAuthenticated) {
      fetchAdminData();
    }
  }, [admin, isAuthenticated, adminLoading]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentFlightPage(1);
    setCurrentBookingPage(1);
    setCurrentPassengerPage(1);
    setCurrentAircraftPage(1);
  }, [searchQuery]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !admin?.airline_id || adminLoading) return;
    
    const interval = setInterval(async () => {
      try {
        const analyticsResponse = await axios.get(`http://localhost:3000/admin/analytics/${admin.airline_id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (analyticsResponse.data.success) {
          setAnalytics(analyticsResponse.data.data.stats || {});
          setBookings(analyticsResponse.data.data.recentBookings || []);
          setFlights(analyticsResponse.data.data.upcomingFlights || []);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, admin?.airline_id, adminLoading]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Function to fetch all bookings
  const fetchAllBookings = async () => {
    if (!admin?.airline_id) return;
    
    try {
      setDataLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:3000/admin/bookings/${admin.airline_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.data.success) {
        setAllBookings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      setError('Failed to load bookings data');
    } finally {
      setDataLoading(false);
    }
  };

  // Function to fetch all flights
  const fetchAllFlights = async () => {
    if (!admin?.airline_id) return;
    
    try {
      setDataLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:3000/admin/flights/${admin.airline_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.data.success) {
        setAllFlights(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching all flights:', error);
      setError('Failed to load flights data');
    } finally {
      setDataLoading(false);
    }
  };

  // Function to fetch aircraft
  const fetchAircraft = async () => {
    if (!admin?.airline_id) return;
    
    try {
      setDataLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:3000/aircraft/airline/${admin.airline_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.data.success) {
        setAircraft(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching aircraft:', error);
      setError('Failed to load aircraft data');
    } finally {
      setDataLoading(false);
    }
  };

  // Handle tab changes and fetch data accordingly
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset pagination when switching tabs
    setCurrentFlightPage(1);
    setCurrentBookingPage(1);
    setCurrentPassengerPage(1);
    setCurrentAircraftPage(1);
    
    switch (tab) {
      case 'bookings':
        if (allBookings.length === 0) {
          fetchAllBookings();
        }
        break;
      case 'flights':
        if (allFlights.length === 0) {
          fetchAllFlights();
        }
        break;
      case 'aircraft':
        if (aircraft.length === 0) {
          fetchAircraft();
        }
        break;
    }
  };

  const tabData = {
    overview: { label: 'Dashboard', icon: BarChart3 },
    bookings: { label: 'Bookings', icon: Calendar },
    flights: { label: 'Flights', icon: Plane },
    aircraft: { label: 'Aircraft', icon: Navigation },
    passengers: { label: 'Passengers', icon: Users },
    settings: { label: 'Settings', icon: Settings }
  };

  // Dynamic stats based on real data from backend
  const stats = [
    { 

      label: 'Total Revenue', 
      value: `$${analytics.totalRevenue ? analytics.totalRevenue.toLocaleString() : '0'}`, 
      change: analytics.todayRevenue > 0 ? `+$${analytics.todayRevenue.toFixed(2)} today` : '$0 today', 
      trend: analytics.todayRevenue > 0 ? 'up' : 'neutral',
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Total earnings',
      percentage: analytics.todayRevenue && analytics.totalRevenue ? 
        `+${((analytics.todayRevenue / analytics.totalRevenue) * 100).toFixed(1)}%` : '+0%'
    },
    { 
      label: 'Total Flights', 
      value: analytics.totalFlights || '0', 
      change: `${analytics.upcomingFlights || 0} upcoming`, 
      trend: analytics.upcomingFlights > 0 ? 'up' : 'neutral',
      icon: Navigation, 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All flights',
      percentage: analytics.upcomingFlights && analytics.totalFlights ? 
        `${((analytics.upcomingFlights / analytics.totalFlights) * 100).toFixed(1)}%` : '0%'
    },
    { 
      label: 'Total Bookings', 
      value: analytics.totalBookings || '0', 
      change: `+${analytics.todayBookings || 0} today`, 
      trend: analytics.todayBookings > 0 ? 'up' : 'neutral',
      icon: Zap, 
      gradient: 'from-purple-500 to-pink-600',
      description: 'All reservations',
      percentage: analytics.todayBookings && analytics.totalBookings ? 
        `+${((analytics.todayBookings / analytics.totalBookings) * 100).toFixed(1)}%` : '+0%'
    },
    { 
      label: 'Total Passengers', 
      value: analytics.totalPassengers || '0', 
      change: `${analytics.pendingBookings || 0} pending`, 
      trend: analytics.confirmedBookings > analytics.pendingBookings ? 'up' : 'neutral',
      icon: Users, 
      gradient: 'from-orange-500 to-red-600',
      description: 'All passengers',
      percentage: analytics.confirmedBookings && analytics.totalBookings ? 
        `${((analytics.confirmedBookings / analytics.totalBookings) * 100).toFixed(1)}%` : '0%'
    }
  ];


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

  // Filter functions
  const filterBookings = (bookingsList) => {
    if (!searchQuery.trim()) return bookingsList;
    const query = searchQuery.toLowerCase();
    return bookingsList.filter(booking => 
      (booking.customer_name && booking.customer_name.toLowerCase().includes(query)) ||
      (booking.first_name && booking.first_name.toLowerCase().includes(query)) ||
      (booking.last_name && booking.last_name.toLowerCase().includes(query)) ||
      (booking.booking_id && booking.booking_id.toString().includes(query)) ||
      (booking.routes && booking.routes.toLowerCase().includes(query)) ||
      (booking.payment_status && booking.payment_status.toLowerCase().includes(query))
    );
  };

  const filterFlights = (flightsList) => {
    if (!searchQuery.trim()) return flightsList;
    const query = searchQuery.toLowerCase();
    return flightsList.filter(flight => 
      (flight.flight_number && flight.flight_number.toLowerCase().includes(query)) ||
      (flight.origin_airport && flight.origin_airport.toLowerCase().includes(query)) ||
      (flight.destination_airport && flight.destination_airport.toLowerCase().includes(query)) ||
      (flight.origin_code && flight.origin_code.toLowerCase().includes(query)) ||
      (flight.destination_code && flight.destination_code.toLowerCase().includes(query)) ||
      (flight.aircraft_model && flight.aircraft_model.toLowerCase().includes(query)) ||
      (flight.airline_name && flight.airline_name.toLowerCase().includes(query))
    );
  };

  const filterAircraft = (aircraftList) => {
    if (!searchQuery.trim()) return aircraftList;
    const query = searchQuery.toLowerCase();
    return aircraftList.filter(plane => 
      (plane.model && plane.model.toLowerCase().includes(query)) ||
      (plane.registration_number && plane.registration_number.toLowerCase().includes(query)) ||
      (plane.aircraft_id && plane.aircraft_id.toString().includes(query)) ||
      (plane.status && plane.status.toLowerCase().includes(query)) ||
      (plane.year_of_manufacture && plane.year_of_manufacture.toString().includes(query))
    );
  };

  const filterPassengers = (passengersList) => {
    if (!searchQuery.trim()) return passengersList;
    const query = searchQuery.toLowerCase();
    return passengersList.filter(booking => 
      (booking.customer_name && booking.customer_name.toLowerCase().includes(query)) ||
      (booking.customer_email && booking.customer_email.toLowerCase().includes(query)) ||
      (booking.customer_phone && booking.customer_phone && booking.customer_phone.toLowerCase().includes(query)) ||
      (booking.routes && booking.routes.toLowerCase().includes(query)) ||
      (booking.booking_id && booking.booking_id.toString().includes(query))
    );
  };

  // Pagination helper functions
  const getPaginatedFlights = (flightsList) => {
    const filtered = filterFlights(flightsList);
    const startIndex = (currentFlightPage - 1) * flightsPerPage;
    const endIndex = startIndex + flightsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalFlightPages = (flightsList) => {
    const filtered = filterFlights(flightsList);
    return Math.ceil(filtered.length / flightsPerPage);
  };

  const handleFlightPageChange = (pageNumber) => {
    setCurrentFlightPage(pageNumber);
  };

  // Pagination helper functions for bookings
  const getPaginatedBookings = (bookingsList) => {
    const filtered = filterBookings(bookingsList);
    const startIndex = (currentBookingPage - 1) * bookingsPerPage;
    const endIndex = startIndex + bookingsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalBookingPages = (bookingsList) => {
    const filtered = filterBookings(bookingsList);
    return Math.ceil(filtered.length / bookingsPerPage);
  };

  const handleBookingPageChange = (pageNumber) => {
    setCurrentBookingPage(pageNumber);
  };

  // Pagination helper functions for passengers
  const getPaginatedPassengers = (passengersList) => {
    const filtered = filterPassengers(passengersList);
    const startIndex = (currentPassengerPage - 1) * passengersPerPage;
    const endIndex = startIndex + passengersPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPassengerPages = (passengersList) => {
    const filtered = filterPassengers(passengersList);
    return Math.ceil(filtered.length / passengersPerPage);
  };

  const handlePassengerPageChange = (pageNumber) => {
    setCurrentPassengerPage(pageNumber);
  };

  // Pagination helper functions for aircraft
  const getPaginatedAircraft = (aircraftList) => {
    const filtered = filterAircraft(aircraftList);
    const startIndex = (currentAircraftPage - 1) * aircraftPerPage;
    const endIndex = startIndex + aircraftPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalAircraftPages = (aircraftList) => {
    const filtered = filterAircraft(aircraftList);
    return Math.ceil(filtered.length / aircraftPerPage);
  };

  const handleAircraftPageChange = (pageNumber) => {
    setCurrentAircraftPage(pageNumber);
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

  const StatusBadge = ({ status }) => {
    const configs = {
      'Confirmed': { 
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600', 
        text: 'text-white',
        glow: 'shadow-emerald-500/25'
      },
      'confirmed': { 
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600', 
        text: 'text-white',
        glow: 'shadow-emerald-500/25'
      },
      'Pending': { 
        bg: 'bg-gradient-to-r from-amber-500 to-orange-600', 
        text: 'text-white',
        glow: 'shadow-amber-500/25'
      },
      'pending': { 
        bg: 'bg-gradient-to-r from-amber-500 to-orange-600', 
        text: 'text-white',
        glow: 'shadow-amber-500/25'
      },
      'Cancelled': { 
        bg: 'bg-gradient-to-r from-red-500 to-rose-600', 
        text: 'text-white',
        glow: 'shadow-red-500/25'
      },
      'cancelled': { 
        bg: 'bg-gradient-to-r from-red-500 to-rose-600', 
        text: 'text-white',
        glow: 'shadow-red-500/25'
      },
      'On Time': { 
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600', 
        text: 'text-white',
        glow: 'shadow-emerald-500/25'
      },
      'Scheduled': { 
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
        text: 'text-white',
        glow: 'shadow-blue-500/25'
      },
      'scheduled': { 
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
        text: 'text-white',
        glow: 'shadow-blue-500/25'
      },
      'Active': { 
        bg: 'bg-gradient-to-r from-green-500 to-emerald-600', 
        text: 'text-white',
        glow: 'shadow-green-500/25'
      },
      'active': { 
        bg: 'bg-gradient-to-r from-green-500 to-emerald-600', 
        text: 'text-white',
        glow: 'shadow-green-500/25'
      },
      'Delayed': { 
        bg: 'bg-gradient-to-r from-red-500 to-rose-600', 
        text: 'text-white',
        glow: 'shadow-red-500/25'
      },
      'Boarding': { 
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
        text: 'text-white',
        glow: 'shadow-blue-500/25'
      }
    };
    
    const config = configs[status] || { bg: 'bg-gray-500', text: 'text-white', glow: 'shadow-gray-500/25' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-lg ${config.glow}`}>
        {status}
      </span>
    );
  };

  const GlowCard = ({ children, className = "" }) => (
    <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300 ${className}`}
         style={{
           boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.3)`,
         }}>
      {children}
    </div>
  );

  // Show loading while AdminContext is loading
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-200">Loading admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-200">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-200/10 to-cyan-200/10 animate-pulse"></div>
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"
            style={{
              left: `${mousePosition.x * 0.01}%`,
              top: `${mousePosition.y * 0.01}%`,
              transition: 'all 0.3s ease-out'
            }}
          ></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-l from-teal-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-3 rounded-2xl hover:bg-gray-100 transition-all duration-300"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center space-x-4">
              {airlineLogo ? (
                <img 
                  src={airlineLogo} 
                  alt={`${admin.airline_name} logo`}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Plane className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  {admin.airline_name || 'NimbusFly'}
                </h1>
                <p className="text-gray-600 text-sm font-medium">Powered by NimbusFly</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-700 text-sm font-medium">
                  {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-gray-600 text-xs">
                  {currentTime.toLocaleDateString()}
                </p>
              </div>
             
                
              
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 bg-white/60 backdrop-blur-xl rounded-2xl p-2 pr-4 hover:bg-white/80 transition-all duration-300 border border-gray-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-800 text-sm font-semibold">{admin.airline_name}</p>
                    <p className="text-gray-600 text-xs">System Administrator</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showProfileDropdown && (
                  <>
                    {/* Backdrop overlay */}
                    <div 
                      className="fixed inset-0 z-[99998]" 
                      onClick={() => setShowProfileDropdown(false)}
                    ></div>
                    
                    {/* Dropdown menu */}
                    <div className="fixed top-20 right-8 w-64 bg-white shadow-2xl rounded-xl border border-gray-200 py-2 z-[99999] animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <p className="text-sm font-semibold text-gray-900">{admin.airline_name}</p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <p className="text-xs text-blue-600 mt-1">NimbusFly Admin Access</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Sign out clicked');
                          setShowProfileDropdown(false);
                          setTimeout(() => {
                            handleLogout();
                          }, 100);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 rounded-lg mx-2 transition-colors duration-200 font-medium"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-30">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-white/60 backdrop-blur-2xl border-r border-gray-200/50 transition-all duration-500 min-h-screen`}>
          <nav className="p-6">
            <ul className="space-y-3">
              {Object.entries(tabData).map(([key, { label, icon: Icon }]) => (
                <li key={key}>
                  <button
                    onClick={() => handleTabChange(key)}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-left transition-all duration-300 group ${
                      activeTab === key 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-blue-300 shadow-lg shadow-blue-500/25' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === key ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'} transition-all duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {sidebarOpen && (
                      <div>
                        <span className="font-semibold text-base">{label}</span>
                       
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            
            
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                    Command Center
                  </h2>
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
                  <select className="px-6 py-3 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800">
                    <option>Real-time</option>
                    <option>Last 24 hours</option>
                    <option>This week</option>
                    <option>This month</option>
                  </select>
                  <button 
                    onClick={() => {
                      const csvData = [
                        ['Metric', 'Value', 'Change', 'Percentage'],
                        ...stats.map(stat => [stat.label, stat.value, stat.change, stat.percentage])
                      ].map(row => row.join(',')).join('\n');
                      const blob = new Blob([csvData], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Export Data</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <GlowCard key={index} className="p-6 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {stat.trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-emerald-500" />
                          ) : stat.trend === 'down' ? (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <Activity className="w-4 h-4 text-gray-500" />
                          )}
                          <span className={`text-sm font-semibold ${
                            stat.trend === 'up' ? 'text-emerald-500' : 
                            stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {stat.percentage}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-gray-400 text-xs">{stat.description}</p>
                    </div>
                  </GlowCard>
                ))}
              </div>

              {/* Enhanced Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <GlowCard className="overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                          <p className="text-gray-500 text-sm">Latest passenger reservations</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                        <span className="text-green-500 text-sm font-medium">Live</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {dataLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-500">Loading bookings...</span>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">
                        <p>Error: {error}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filterBookings(bookings).slice(0, 4).map((booking, index) => (
                          <div key={booking.booking_id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                {booking.customer_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {booking.customer_name || 'Unknown Customer'}
                                </p>
                                <p className="text-sm text-gray-500">{booking.routes || 'Route not available'}</p>
                                <p className="text-xs text-gray-400">#{booking.booking_id} • {formatDate(booking.booking_date)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-lg">${parseFloat(booking.total_amount || 0).toFixed(2)}</p>
                              <StatusBadge status={booking.payment_status} />
                            </div>
                          </div>
                        ))}
                        {filterBookings(bookings).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{searchQuery ? 'No bookings match your search' : 'No bookings available'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </GlowCard>

                {/* Flight Operations */}
                <GlowCard className="overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl flex items-center justify-center">
                          <Plane className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Flight Operations</h3>
                          <p className="text-gray-500 text-sm">Live flight tracking</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-blue-500 text-sm font-medium">Tracking</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {filterFlights(flights).slice(0, 4).map((flight, index) => (
                        <div key={flight.flight_id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Navigation className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                {flight.flight_number}
                              </p>
                              <p className="text-sm text-gray-500">{flight.origin_code || flight.origin_airport} → {flight.destination_code || flight.destination_airport}</p>
                              <p className="text-xs text-gray-400">{formatDate(flight.departure_time)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">{formatTime(flight.departure_time)} → {formatTime(flight.arrival_time)}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <StatusBadge status="Scheduled" />
                              <span className="text-xs text-gray-500 font-medium">{flight.booked_passengers || 0}/{flight.total_capacity || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filterFlights(flights).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>{searchQuery ? 'No flights match your search' : 'No flights available'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlowCard>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                    Booking Management
                  </h2>
                  <p className="text-gray-600 text-lg">Advanced reservation control system</p>
                </div>
                
              </div>

              {/* Bookings Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings || '0'}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                      <p className="text-3xl font-bold text-green-600">{analytics.confirmedBookings || '0'}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{bookings.filter(b => b.payment_status?.toLowerCase() === 'pending').length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Bookings Table */}
              <GlowCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Booking ID</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Route</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getPaginatedBookings(allBookings.length > 0 ? allBookings : bookings).map((booking, index) => (
                        <tr key={booking.booking_id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors duration-200">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">#{booking.booking_id}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
                                {booking.customer_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{booking.customer_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{booking.customer_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{booking.routes || 'N/A'}</td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{formatDate(booking.booking_date)}</td>
                          <td className="px-8 py-6"><StatusBadge status={booking.payment_status} /></td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-900">${parseFloat(booking.total_amount || 0).toFixed(2)}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                                <Edit3 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getPaginatedBookings(allBookings.length > 0 ? allBookings : bookings).length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{searchQuery ? 'No bookings match your search' : 'No bookings available'}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls for Bookings */}
                {getTotalBookingPages(allBookings.length > 0 ? allBookings : bookings) > 1 && (
                  <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentBookingPage - 1) * bookingsPerPage) + 1} to {Math.min(currentBookingPage * bookingsPerPage, filterBookings(allBookings.length > 0 ? allBookings : bookings).length)} of {filterBookings(allBookings.length > 0 ? allBookings : bookings).length} bookings
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBookingPageChange(currentBookingPage - 1)}
                        disabled={currentBookingPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentBookingPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(getTotalBookingPages(allBookings.length > 0 ? allBookings : bookings))].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentBookingPage;
                        
                        const totalPages = getTotalBookingPages(allBookings.length > 0 ? allBookings : bookings);
                        const showPage = pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        (pageNumber >= currentBookingPage - 1 && pageNumber <= currentBookingPage + 1);
                        
                        if (!showPage && pageNumber === 2 && currentBookingPage > 4) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage && pageNumber === totalPages - 1 && currentBookingPage < totalPages - 3) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handleBookingPageChange(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              isCurrentPage
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handleBookingPageChange(currentBookingPage + 1)}
                        disabled={currentBookingPage === getTotalBookingPages(allBookings.length > 0 ? allBookings : bookings)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentBookingPage === getTotalBookingPages(allBookings.length > 0 ? allBookings : bookings)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </GlowCard>
            </div>
          )}

          {/* Flights Tab */}
          {activeTab === 'flights' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                    Flight Management
                  </h2>
                  <p className="text-gray-600 text-lg">Comprehensive flight operations control</p>
                </div>
                <div className="flex items-center space-x-4">
                  
                  <button 
                    onClick={() => alert('Add Flight feature coming soon!')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300"
                  >
                    
                    <span className="font-semibold">Add Flight</span>
                  </button>
                </div>
              </div>

              {/* Flight Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Flights</p>
                      <p className="text-3xl font-bold text-gray-900">{flights.length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <Plane className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active Today</p>
                      <p className="text-3xl font-bold text-green-600">{flights.filter(f => f.status?.toLowerCase() === 'active').length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Average Load</p>
                      <p className="text-3xl font-bold text-purple-600">{analytics.avgOccupancy || '0'}%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">On Schedule</p>
                      <p className="text-3xl font-bold text-cyan-600">{Math.round((flights.length * 0.85))} / {flights.length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow-md">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Flights Table */}
              <GlowCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Flight</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Route</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Aircraft</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Schedule</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Capacity</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getPaginatedFlights(allFlights.length > 0 ? allFlights : flights).map((flight, index) => (
                        <tr key={flight.flight_id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors duration-200">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                <Plane className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{flight.flight_number}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{flight.origin_airport}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-sm font-medium text-gray-900">{flight.destination_airport}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{flight.aircraft_model || 'N/A'}</td>
                          <td className="px-8 py-6">
                            <div className="text-sm text-gray-600">
                              <p>{formatTime(flight.departure_time)} - {formatTime(flight.arrival_time)}</p>
                              <p className="text-xs text-gray-500">{formatDate(flight.departure_time)}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{flight.total_seats - flight.available_seats}/{flight.total_seats}</span>
                              <p className="text-xs text-gray-500">{Math.round(((flight.total_seats - flight.available_seats) / flight.total_seats) * 100)}% full</p>
                            </div>
                          </td>
                          <td className="px-8 py-6"><StatusBadge status={flight.status || 'Scheduled'} /></td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                                <Edit3 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getPaginatedFlights(allFlights.length > 0 ? allFlights : flights).length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                            <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{searchQuery ? 'No flights match your search' : 'No flights available'}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {getTotalFlightPages(allFlights.length > 0 ? allFlights : flights) > 1 && (
                  <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentFlightPage - 1) * flightsPerPage) + 1} to {Math.min(currentFlightPage * flightsPerPage, filterFlights(allFlights.length > 0 ? allFlights : flights).length)} of {filterFlights(allFlights.length > 0 ? allFlights : flights).length} flights
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFlightPageChange(currentFlightPage - 1)}
                        disabled={currentFlightPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentFlightPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(getTotalFlightPages(allFlights.length > 0 ? allFlights : flights))].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentFlightPage;
                        
                        // Show first page, last page, current page, and pages around current page
                        const totalPages = getTotalFlightPages(allFlights.length > 0 ? allFlights : flights);
                        const showPage = pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        (pageNumber >= currentFlightPage - 1 && pageNumber <= currentFlightPage + 1);
                        
                        if (!showPage && pageNumber === 2 && currentFlightPage > 4) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage && pageNumber === totalPages - 1 && currentFlightPage < totalPages - 3) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handleFlightPageChange(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              isCurrentPage
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handleFlightPageChange(currentFlightPage + 1)}
                        disabled={currentFlightPage === getTotalFlightPages(allFlights.length > 0 ? allFlights : flights)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentFlightPage === getTotalFlightPages(allFlights.length > 0 ? allFlights : flights)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </GlowCard>
            </div>
          )}

          {/* Passengers Tab */}
          {activeTab === 'passengers' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                    Passenger Management
                  </h2>
                  <p className="text-gray-600 text-lg">Customer database and analytics</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-6 py-3 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl hover:bg-white flex items-center space-x-2 text-gray-700 transition-all duration-300">
                    <Search className="w-5 h-5" />
                    <span className="font-semibold">Search Passengers</span>
                  </button>
                  
                </div>
              </div>

              {/* Passenger Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Passengers</p>
                      <p className="text-3xl font-bold text-gray-900">{bookings.reduce((sum, booking) => sum + (booking.total_passengers || 1), 0)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Frequent Flyers</p>
                      <p className="text-3xl font-bold text-gold-600">{Math.round(bookings.length * 0.15)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">New Customers</p>
                      <p className="text-3xl font-bold text-green-600">{Math.round(bookings.length * 0.25)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Satisfaction</p>
                      <p className="text-3xl font-bold text-blue-600">4.8/5</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Recent Passengers */}
              <GlowCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Passengers</h3>
                <div className="space-y-4">
                  {getPaginatedPassengers(allBookings.length > 0 ? allBookings : bookings).map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {booking.customer_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{booking.customer_name || 'Unknown Customer'}</p>
                          <p className="text-sm text-gray-500">{booking.customer_email}</p>
                          <p className="text-xs text-gray-400">Last flight: {booking.routes}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">{booking.total_passengers || 1} passenger(s)</p>
                        <p className="text-xs text-gray-500">{formatDate(booking.booking_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls for Passengers */}
                {getTotalPassengerPages(allBookings.length > 0 ? allBookings : bookings) > 1 && (
                  <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPassengerPage - 1) * passengersPerPage) + 1} to {Math.min(currentPassengerPage * passengersPerPage, filterPassengers(allBookings.length > 0 ? allBookings : bookings).length)} of {filterPassengers(allBookings.length > 0 ? allBookings : bookings).length} passengers
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePassengerPageChange(currentPassengerPage - 1)}
                        disabled={currentPassengerPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPassengerPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(getTotalPassengerPages(allBookings.length > 0 ? allBookings : bookings))].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentPassengerPage;
                        
                        const totalPages = getTotalPassengerPages(allBookings.length > 0 ? allBookings : bookings);
                        const showPage = pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        (pageNumber >= currentPassengerPage - 1 && pageNumber <= currentPassengerPage + 1);
                        
                        if (!showPage && pageNumber === 2 && currentPassengerPage > 4) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage && pageNumber === totalPages - 1 && currentPassengerPage < totalPages - 3) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePassengerPageChange(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              isCurrentPage
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePassengerPageChange(currentPassengerPage + 1)}
                        disabled={currentPassengerPage === getTotalPassengerPages(allBookings.length > 0 ? allBookings : bookings)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPassengerPage === getTotalPassengerPages(allBookings.length > 0 ? allBookings : bookings)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </GlowCard>
            </div>
          )}

          {/* Aircraft Tab */}
          {activeTab === 'aircraft' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                    Aircraft Management
                  </h2>
                  <p className="text-gray-600 text-lg">Fleet management and aircraft operations</p>
                </div>
                <div className="flex items-center space-x-4">
                 
                  <button 
                    onClick={() => alert('Add Aircraft feature coming soon!')}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 transition-colors duration-200"
                  >
                    <span className="font-semibold">Add Aircraft</span>
                  </button>
                </div>
              </div>

              {/* Aircraft Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Aircraft</p>
                      <p className="text-3xl font-bold text-gray-900">{aircraft.length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow-md">
                      <Navigation className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active Aircraft</p>
                      <p className="text-3xl font-bold text-green-600">{aircraft.filter(a => a.status?.toLowerCase() === 'active').length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
                      <Plane className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Capacity</p>
                      <p className="text-3xl font-bold text-blue-600">{aircraft.reduce((sum, a) => sum + (a.total_seats || 0), 0)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Avg Age</p>
                      <p className="text-3xl font-bold text-purple-600">{aircraft.length > 0 ? Math.round(aircraft.reduce((sum, a) => sum + (new Date().getFullYear() - (a.year_of_manufacture || 2020)), 0) / aircraft.length) : 0} yrs</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Aircraft Table */}
              <GlowCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-cyan-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Aircraft ID</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Model</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Registration</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Capacity</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Year</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getPaginatedAircraft(aircraft).map((plane, index) => (
                        <tr key={plane.aircraft_id || index} className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-colors duration-200">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Navigation className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-bold text-gray-900">#{plane.aircraft_id}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium text-gray-900">{plane.model || 'N/A'}</td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{plane.registration_number || 'N/A'}</td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{plane.total_seats || 0} seats</td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{plane.year_of_manufacture || 'N/A'}</td>
                          <td className="px-8 py-6"><StatusBadge status={plane.status || 'Active'} /></td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors duration-200">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                                <Edit3 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getPaginatedAircraft(aircraft).length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                            <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{searchQuery ? 'No aircraft match your search' : 'No aircraft available'}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls for Aircraft */}
                {getTotalAircraftPages(aircraft) > 1 && (
                  <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentAircraftPage - 1) * aircraftPerPage) + 1} to {Math.min(currentAircraftPage * aircraftPerPage, filterAircraft(aircraft).length)} of {filterAircraft(aircraft).length} aircraft
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAircraftPageChange(currentAircraftPage - 1)}
                        disabled={currentAircraftPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentAircraftPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-cyan-600 hover:bg-cyan-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(getTotalAircraftPages(aircraft))].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentAircraftPage;
                        
                        const totalPages = getTotalAircraftPages(aircraft);
                        const showPage = pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        (pageNumber >= currentAircraftPage - 1 && pageNumber <= currentAircraftPage + 1);
                        
                        if (!showPage && pageNumber === 2 && currentAircraftPage > 4) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage && pageNumber === totalPages - 1 && currentAircraftPage < totalPages - 3) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handleAircraftPageChange(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              isCurrentPage
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:text-cyan-600 hover:bg-cyan-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handleAircraftPageChange(currentAircraftPage + 1)}
                        disabled={currentAircraftPage === getTotalAircraftPages(aircraft)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentAircraftPage === getTotalAircraftPages(aircraft)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:text-cyan-600 hover:bg-cyan-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </GlowCard>
            </div>
          )}

          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                    Settings & Configuration
                  </h2>
                  <p className="text-gray-600 text-lg">System preferences and airline configuration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Airline Settings */}
                <GlowCard className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Airline Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Airline Name</label>
                      <input
                        type="text"
                        value={admin.airline_name || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={admin.email || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin ID</label>
                      <input
                        type="text"
                        value={admin.admin_id || admin.id || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </GlowCard>

                {/* System Settings */}
                <GlowCard className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">System Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive booking and flight updates</p>
                      </div>
                      <button 
                        onClick={() => alert('Email notifications settings coming soon!')}
                        className="w-12 h-6 bg-cyan-500 rounded-full p-1 transition-colors hover:bg-cyan-600"
                      >
                        <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Real-time Updates</p>
                        <p className="text-sm text-gray-500">Live dashboard refreshing</p>
                      </div>
                      <button 
                        onClick={() => alert('Real-time updates settings coming soon!')}
                        className="w-12 h-6 bg-cyan-500 rounded-full p-1 transition-colors hover:bg-cyan-600"
                      >
                        <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Data Analytics</p>
                        <p className="text-sm text-gray-500">Advanced reporting features</p>
                      </div>
                      <button 
                        onClick={() => alert('Data analytics settings coming soon!')}
                        className="w-12 h-6 bg-cyan-500 rounded-full p-1 transition-colors hover:bg-cyan-600"
                      >
                        <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Security Settings */}
              <GlowCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Security & Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-bold text-gray-900 mb-2">Security Status</h4>
                    <p className="text-sm text-green-600 font-medium">Fully Secured</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-bold text-gray-900 mb-2">Admin Access</h4>
                    <p className="text-sm text-blue-600 font-medium">Full Privileges</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h4 className="font-bold text-gray-900 mb-2">Data Backup</h4>
                    <p className="text-sm text-purple-600 font-medium">Auto-sync Enabled</p>
                  </div>
                </div>
              </GlowCard>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-20">
        <button 
          onClick={() => setActiveTab('bookings')}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white hover:shadow-blue-500/70 transition-shadow duration-200 animate-pulse"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;