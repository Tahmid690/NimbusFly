import React, { useState, useEffect } from 'react';
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
  Signal
} from 'lucide-react';

const AirlineAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const tabData = {
    overview: { label: 'Dashboard', icon: BarChart3 },
    bookings: { label: 'Bookings', icon: Calendar },
    flights: { label: 'Flights', icon: Plane },
    passengers: { label: 'Passengers', icon: Users },
    reports: { label: 'Analytics', icon: TrendingUp },
    settings: { label: 'Settings', icon: Settings }
  };

  const stats = [
    { 
      label: 'Total Revenue', 
      value: '$2.8M', 
      change: '+23.5%', 
      trend: 'up',
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Monthly earnings'
    },
    { 
      label: 'Active Flights', 
      value: '247', 
      change: '+8.2%', 
      trend: 'up',
      icon: Navigation, 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Currently airborne'
    },
    { 
      label: 'Bookings Today', 
      value: '1,847', 
      change: '+15.3%', 
      trend: 'up',
      icon: Zap, 
      gradient: 'from-purple-500 to-pink-600',
      description: 'New reservations'
    },
    { 
      label: 'Passenger Load', 
      value: '89.2%', 
      change: '+4.7%', 
      trend: 'up',
      icon: Users, 
      gradient: 'from-orange-500 to-red-600',
      description: 'Fleet utilization'
    }
  ];

  const recentBookings = [
    { 
      id: 'BK001', 
      passenger: 'Alexandra Chen', 
      route: 'JFK → LAX', 
      date: '2025-07-15', 
      status: 'Confirmed', 
      amount: '$1,285',
      class: 'First Class',
      avatar: '👩‍💼'
    },
    { 
      id: 'BK002', 
      passenger: 'Marcus Rodriguez', 
      route: 'ORD → MIA', 
      date: '2025-07-16', 
      status: 'Pending', 
      amount: '$745',
      class: 'Business',
      avatar: '👨‍💻'
    },
    { 
      id: 'BK003', 
      passenger: 'Emily Thompson', 
      route: 'LAX → SEA', 
      date: '2025-07-17', 
      status: 'Confirmed', 
      amount: '$425',
      class: 'Economy',
      avatar: '👩‍🎨'
    },
    { 
      id: 'BK004', 
      passenger: 'David Kim', 
      route: 'BOS → DEN', 
      date: '2025-07-18', 
      status: 'Cancelled', 
      amount: '$590',
      class: 'Premium',
      avatar: '👨‍🔬'
    }
  ];

  const upcomingFlights = [
    { 
      flight: 'SL101', 
      route: 'JFK → LAX', 
      departure: '08:30', 
      arrival: '11:45', 
      status: 'On Time', 
      passengers: 278,
      aircraft: 'Boeing 777-300ER',
      gate: 'A12'
    },
    { 
      flight: 'SL205', 
      route: 'ORD → MIA', 
      departure: '14:15', 
      arrival: '17:30', 
      status: 'Delayed', 
      passengers: 156,
      aircraft: 'Airbus A321',
      gate: 'B7'
    },
    { 
      flight: 'SL308', 
      route: 'LAX → SEA', 
      departure: '19:20', 
      arrival: '21:40', 
      status: 'Boarding', 
      passengers: 189,
      aircraft: 'Boeing 737-800',
      gate: 'C15'
    }
  ];

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
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-lg ${config.glow} animate-pulse`}>
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
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  SkyLine Airlines
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
              
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-xl rounded-2xl p-2 pr-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Sarah Mitchell</p>
                  <p className="text-cyan-200 text-xs">System Administrator</p>
                </div>
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
                    onClick={() => setActiveTab(key)}
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
                      {recentBookings.map((booking, index) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{booking.avatar}</div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {booking.passenger}
                              </p>
                              <p className="text-sm text-gray-500">{booking.route}</p>
                              <p className="text-xs text-gray-400">{booking.class} • {booking.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">{booking.amount}</p>
                            <StatusBadge status={booking.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowCard>

                {/* Upcoming Flights */}
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
                      {upcomingFlights.map((flight, index) => (
                        <div key={flight.flight} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Navigation className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                {flight.flight}
                              </p>
                              <p className="text-sm text-gray-500">{flight.route}</p>
                              <p className="text-xs text-gray-400">{flight.aircraft} • Gate {flight.gate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">{flight.departure} → {flight.arrival}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <StatusBadge status={flight.status} />
                              <span className="text-xs text-gray-500 font-medium">{flight.passengers} pax</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </div>
            </div>
          )}

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

              <GlowCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Booking</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Passenger</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Route</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Class</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentBookings.map((booking, index) => (
                        <tr key={booking.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{booking.id}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{booking.avatar}</div>
                              <span className="text-sm font-medium text-gray-900">{booking.passenger}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{booking.route}</td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{booking.class}</td>
                          <td className="px-8 py-6 text-sm text-gray-600 font-medium">{booking.date}</td>
                          <td className="px-8 py-6"><StatusBadge status={booking.status} /></td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-900">{booking.amount}</td>
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
                    </tbody>
                  </table>
                </div>
              </GlowCard>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'bookings' && (
            <div className="text-center py-20">
              <GlowCard className="max-w-md mx-auto p-12">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
                  
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{tabData[activeTab]?.label}</h3>
                <p className="text-gray-500 mb-6">This premium module is currently under development</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-cyan-600">
                  <Layers className="w-4 h-4" />
                  <span className="font-medium">Coming Soon</span>
                </div>
              </GlowCard>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-20">
        <button className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow-2xl shadow-pink-500/50 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 animate-pulse">
          <Star className="w-8 h-8" />
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

export default AirlineAdminDashboard;