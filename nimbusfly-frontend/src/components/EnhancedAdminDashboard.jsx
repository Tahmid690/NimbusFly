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

const EnhancedAdminDashboard = () => {
  const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Data states
  const [dataLoading, setDataLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
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

    if (!adminLoading && admin && isAuthenticated) {
      fetchAdminData();
    }
  }, [admin, isAuthenticated, adminLoading]);

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

  // Handle tab changes and fetch data accordingly
  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
    }
  };

  const tabData = {
    overview: { label: 'Dashboard', icon: BarChart3 },
    bookings: { label: 'Bookings', icon: Calendar },
    flights: { label: 'Flights', icon: Plane },
    passengers: { label: 'Passengers', icon: Users },
    reports: { label: 'Analytics', icon: TrendingUp },
    settings: { label: 'Settings', icon: Settings }
  };

  // Dynamic stats based on real data
  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${analytics.totalRevenue ? analytics.totalRevenue.toLocaleString() : '0'}`, 
      change: analytics.todayRevenue ? `+$${analytics.todayRevenue.toFixed(2)} today` : 'No revenue today', 
      trend: 'up',
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Total earnings'
    },
    { 
      label: 'Total Flights', 
      value: analytics.totalFlights || '0', 
      change: analytics.upcomingFlights ? `${analytics.upcomingFlights} upcoming` : 'No upcoming flights', 
      trend: 'up',
      icon: Navigation, 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All flights'
    },
    { 
      label: 'Total Bookings', 
      value: analytics.totalBookings || '0', 
      change: analytics.todayBookings ? `+${analytics.todayBookings} today` : 'No bookings today', 
      trend: 'up',
      icon: Zap, 
      gradient: 'from-purple-500 to-pink-600',
      description: 'All reservations'
    },
    { 
      label: 'Confirmed Bookings', 
      value: analytics.confirmedBookings || '0', 
      change: analytics.pendingBookings ? `${analytics.pendingBookings} pending` : 'No pending bookings', 
      trend: 'up',
      icon: Users, 
      gradient: 'from-orange-500 to-red-600',
      description: 'Confirmed reservations'
    }
  ];

  // Helper function to get airline logo
  const getAirlineLogo = (airlineName) => {
    if (!airlineName) return '/nimbusfly_logo.png';
    
    const airline = airlineName.toLowerCase();
    if (airline.includes('american')) return '/aa.jpeg';
    if (airline.includes('british')) return '/ba.png';
    if (airline.includes('biman')) return '/bba.png';
    if (airline.includes('us bangla')) return '/usba.png';
    if (airline.includes('saudi')) return '/saa.png';
    if (airline.includes('novoair')) return '/na.png';
    
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

  const StatusBadge = ({ status }) => {
    const configs = {
      'Confirmed': { 
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600', 
        text: 'text-white',
        glow: 'shadow-emerald-500/25'
      },
      'Pending': { 
        bg: 'bg-gradient-to-r from-amber-500 to-orange-600', 
        text: 'text-white',
        glow: 'shadow-amber-500/25'
      },
      'Cancelled': { 
        bg: 'bg-gradient-to-r from-red-500 to-rose-600', 
        text: 'text-white',
        glow: 'shadow-red-500/25'
      },
      'On Time': { 
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600', 
        text: 'text-white',
        glow: 'shadow-emerald-500/25'
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
    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] ${className}`}
         style={{
           boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 animate-pulse"></div>
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"
            style={{
              left: `${mousePosition.x * 0.01}%`,
              top: `${mousePosition.y * 0.01}%`,
              transition: 'all 0.3s ease-out'
            }}
          ></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-l from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-3 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                {airlineLogo ? (
                  <img 
                    src={airlineLogo} 
                    alt={`${admin.airline_name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.src = getAirlineLogo(admin.airline_name);
                    }}
                  />
                ) : (
                  <Plane className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  {admin.airline_name || 'NimbusFly'}
                </h1>
                <p className="text-cyan-200 text-sm font-medium">Premium Aviation Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="w-5 h-5 text-cyan-200 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search flights, bookings, passengers..."
                className="pl-12 pr-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 transition-all duration-300 text-white placeholder-cyan-200 w-80"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-cyan-200 text-sm font-medium">
                  {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-white text-xs">
                  {currentTime.toLocaleDateString()}
                </p>
              </div>
              
              <button className="p-3 text-cyan-200 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 bg-white/10 backdrop-blur-xl rounded-2xl p-2 pr-4 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-semibold">{admin.airline_name}</p>
                    <p className="text-cyan-200 text-xs">System Administrator</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-cyan-200 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
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
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-white/5 backdrop-blur-2xl border-r border-white/10 transition-all duration-500 min-h-screen`}>
          <nav className="p-6">
            <ul className="space-y-3">
              {Object.entries(tabData).map(([key, { label, icon: Icon }]) => (
                <li key={key}>
                  <button
                    onClick={() => handleTabChange(key)}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-left transition-all duration-300 group ${
                      activeTab === key 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-400/30 shadow-lg shadow-cyan-500/25' 
                        : 'text-cyan-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === key ? 'bg-gradient-to-r from-cyan-400 to-blue-600' : 'bg-white/10 group-hover:bg-white/20'} transition-all duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {sidebarOpen && (
                      <div>
                        <span className="font-semibold text-base">{label}</span>
                        {activeTab === key && (
                          <div className="text-xs text-cyan-300 mt-1">Active Module</div>
                        )}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            
            {sidebarOpen && (
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">System Status</p>
                    <p className="text-purple-200 text-xs">All systems operational</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-purple-200">
                  <span>Uptime: 99.9%</span>
                  <div className="flex space-x-1">
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3 h-3" />
                    <Signal className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                    Command Center
                  </h2>
                  <p className="text-cyan-200 text-lg">Real-time aviation operations dashboard</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white">
                    <option>Real-time</option>
                    <option>Last 24 hours</option>
                    <option>This week</option>
                    <option>This month</option>
                  </select>
                  <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-700 flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all duration-300">
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Export Data</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <GlowCard key={index} className="p-6 group hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {stat.trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stat.change}
                          </span>
                        </div>
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
                    <div className="space-y-4">
                      {bookings.slice(0, 4).map((booking, index) => (
                        <div key={booking.booking_id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                              {booking.customer_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {booking.customer_name || 'Unknown Customer'}
                              </p>
                              <p className="text-sm text-gray-500">{booking.routes || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{booking.trip_type} • {formatDate(booking.booking_date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">${parseFloat(booking.total_amount || 0).toFixed(2)}</p>
                            <StatusBadge status={booking.payment_status} />
                          </div>
                        </div>
                      ))}
                      {bookings.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No bookings available</p>
                        </div>
                      )}
                    </div>
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
                      {flights.slice(0, 4).map((flight, index) => (
                        <div key={flight.flight_id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Navigation className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                {flight.flight_number}
                              </p>
                              <p className="text-sm text-gray-500">{flight.origin_airport} → {flight.destination_airport}</p>
                              <p className="text-xs text-gray-400">{flight.aircraft_model}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">{formatTime(flight.departure_time)} → {formatTime(flight.arrival_time)}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <StatusBadge status={flight.status || 'Scheduled'} />
                              <span className="text-xs text-gray-500 font-medium">{flight.total_seats - flight.available_seats}/{flight.total_seats}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {flights.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No flights available</p>
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
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                    Booking Management
                  </h2>
                  <p className="text-cyan-200 text-lg">Advanced reservation control system</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 flex items-center space-x-2 text-white transition-all duration-300">
                    <Filter className="w-5 h-5" />
                    <span className="font-semibold">Advanced Filter</span>
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 transition-all duration-300">
                    <span className="font-semibold">New Booking</span>
                  </button>
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
                      {(allBookings.length > 0 ? allBookings : bookings).map((booking, index) => (
                        <tr key={booking.booking_id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
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
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300">
                                <Edit3 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No bookings available</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlowCard>
            </div>
          )}

          {/* Flights Tab */}
          {activeTab === 'flights' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                    Flight Management
                  </h2>
                  <p className="text-cyan-200 text-lg">Comprehensive flight operations control</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 flex items-center space-x-2 text-white transition-all duration-300">
                    <Filter className="w-5 h-5" />
                    <span className="font-semibold">Filter Flights</span>
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300">
                    <Plus className="w-5 h-5 mr-2" />
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
                      {flights.map((flight, index) => (
                        <tr key={flight.flight_id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300">
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
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300">
                                <Edit3 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {flights.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-8 py-12 text-center text-gray-500">
                            <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No flights available</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlowCard>
            </div>
          )}

          {/* Passengers Tab */}
          {activeTab === 'passengers' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                    Passenger Management
                  </h2>
                  <p className="text-cyan-200 text-lg">Customer database and analytics</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/20 flex items-center space-x-2 text-white transition-all duration-300">
                    <Search className="w-5 h-5" />
                    <span className="font-semibold">Search Passengers</span>
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all duration-300">
                    <Download className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Export Data</span>
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
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Passengers</h3>
                <div className="space-y-4">
                  {bookings.slice(0, 8).map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
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
              </GlowCard>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                    Analytics & Reports
                  </h2>
                  <p className="text-cyan-200 text-lg">Business intelligence dashboard</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>This year</option>
                  </select>
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25 transition-all duration-300">
                    <Download className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Export Report</span>
                  </button>
                </div>
              </div>

              {/* Analytics Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Revenue Growth</p>
                      <p className="text-3xl font-bold text-green-600">+23.5%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Booking Rate</p>
                      <p className="text-3xl font-bold text-blue-600">89.2%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Customer Retention</p>
                      <p className="text-3xl font-bold text-purple-600">94.1%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Profit Margin</p>
                      <p className="text-3xl font-bold text-orange-600">31.8%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlowCard className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Trends</h3>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Revenue Chart</p>
                      <p className="text-sm">Chart integration coming soon</p>
                    </div>
                  </div>
                </GlowCard>
                
                <GlowCard className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Distribution</h3>
                  <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Distribution Chart</p>
                      <p className="text-sm">Chart integration coming soon</p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                    Settings & Configuration
                  </h2>
                  <p className="text-cyan-200 text-lg">System preferences and airline configuration</p>
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
                      <button className="w-12 h-6 bg-cyan-500 rounded-full p-1 transition-colors">
                        <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Real-time Updates</p>
                        <p className="text-sm text-gray-500">Live dashboard refreshing</p>
                      </div>
                      <button className="w-12 h-6 bg-cyan-500 rounded-full p-1 transition-colors">
                        <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Data Analytics</p>
                        <p className="text-sm text-gray-500">Advanced reporting features</p>
                      </div>
                      <button className="w-12 h-6 bg-cyan-500 rounded-full p-1 transition-colors">
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
          className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow-2xl shadow-pink-500/50 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 animate-pulse"
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

export default EnhancedAdminDashboard;