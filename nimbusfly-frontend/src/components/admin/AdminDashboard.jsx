import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  TicketIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckIcon,
  Bars3Icon,
  HomeIcon
} from "@heroicons/react/24/outline";

function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("admin_name") || "Admin";
  const airlineName = localStorage.getItem("airline_name") || "Your Airline";
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [showEditFlight, setShowEditFlight] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample data - In a real app, this would come from API
  const sampleFlights = [
    {
      id: 1,
      flightNumber: "NF001",
      from: "Dhaka",
      to: "Cox's Bazar",
      departure: "2024-01-15T08:00:00",
      arrival: "2024-01-15T09:30:00",
      aircraft: "Boeing 737",
      totalSeats: 150,
      bookedSeats: 120,
      price: 5500,
      status: "Scheduled"
    },
    {
      id: 2,
      flightNumber: "NF002",
      from: "Chittagong",
      to: "Sylhet",
      departure: "2024-01-15T14:00:00",
      arrival: "2024-01-15T15:45:00",
      aircraft: "Airbus A320",
      totalSeats: 180,
      bookedSeats: 95,
      price: 4200,
      status: "Scheduled"
    }
  ];

  const sampleBookings = [
    {
      id: 1,
      bookingRef: "NF2024001",
      passenger: "John Doe",
      flight: "NF001",
      route: "Dhaka → Cox's Bazar",
      date: "2024-01-15",
      amount: 5500,
      status: "Confirmed"
    },
    {
      id: 2,
      bookingRef: "NF2024002",
      passenger: "Jane Smith",
      flight: "NF002",
      route: "Chittagong → Sylhet",
      date: "2024-01-15",
      amount: 4200,
      status: "Pending"
    }
  ];

  useEffect(() => {
    setFlights(sampleFlights);
    setBookings(sampleBookings);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const handleAddFlight = (flightData) => {
    const newFlight = {
      id: flights.length + 1,
      ...flightData,
      bookedSeats: 0,
      status: "Scheduled"
    };
    setFlights([...flights, newFlight]);
    setShowAddFlight(false);
  };

  const handleEditFlight = (flightData) => {
    setFlights(flights.map(flight => 
      flight.id === selectedFlight.id ? { ...flight, ...flightData } : flight
    ));
    setShowEditFlight(false);
    setSelectedFlight(null);
  };

  const handleDeleteFlight = (flightId) => {
    if (window.confirm("Are you sure you want to delete this flight?")) {
      setFlights(flights.filter(flight => flight.id !== flightId));
    }
  };

  const stats = {
    totalFlights: flights.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + booking.amount, 0),
    averageOccupancy: flights.reduce((sum, flight) => sum + (flight.bookedSeats / flight.totalSeats), 0) / flights.length * 100
  };

  const FlightForm = ({ flight, onSubmit, onCancel, title }) => {
    const [formData, setFormData] = useState({
      flightNumber: flight?.flightNumber || "",
      from: flight?.from || "",
      to: flight?.to || "",
      departure: flight?.departure || "",
      arrival: flight?.arrival || "",
      aircraft: flight?.aircraft || "",
      totalSeats: flight?.totalSeats || "",
      price: flight?.price || ""
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{title}</h3>
            <button 
              onClick={onCancel} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Number</label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., NF001"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
                <input
                  type="text"
                  value={formData.from}
                  onChange={(e) => setFormData({...formData, from: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Departure city"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData({...formData, to: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Destination city"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Departure</label>
                <input
                  type="datetime-local"
                  value={formData.departure}
                  onChange={(e) => setFormData({...formData, departure: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Arrival</label>
                <input
                  type="datetime-local"
                  value={formData.arrival}
                  onChange={(e) => setFormData({...formData, arrival: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Aircraft</label>
              <select
                value={formData.aircraft}
                onChange={(e) => setFormData({...formData, aircraft: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Aircraft</option>
                <option value="Boeing 737">Boeing 737</option>
                <option value="Airbus A320">Airbus A320</option>
                <option value="Boeing 787">Boeing 787</option>
                <option value="Airbus A350">Airbus A350</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Seats</label>
                <input
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({...formData, totalSeats: parseInt(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="150"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (BDT)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="5500"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="flex-1 relative overflow-hidden px-6 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group focus:outline-none bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white focus:ring-4 focus:ring-blue-300/50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative">{flight ? "Update Flight" : "Add Flight"}</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with NimbusFly Branding */}
      <header className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-blue-100/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src="/lgp.png"
                    alt="NimbusFly Logo"
                    className="h-10 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-nunito font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                    NimbusFly
                  </span>
                  <span className="text-xs text-blue-600 font-medium -mt-1">
                    Admin Dashboard
                  </span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gradient-to-b from-blue-200 to-indigo-200 mx-4"></div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Welcome back, {adminName}</h1>
                <p className="text-sm text-gray-600">{airlineName} • Administrator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">3</span>
                </button>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="relative overflow-hidden px-6 py-2 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group focus:outline-none bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white focus:ring-4 focus:ring-red-300/50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-lg border-b border-blue-100/50 sticky top-[88px] z-30">
        <div className="px-6">
          <nav className="flex space-x-1">
            {[
              { id: "overview", label: "Overview", icon: HomeIcon },
              { id: "flights", label: "Flight Management", icon: PaperAirplaneIcon },
              { id: "bookings", label: "Bookings", icon: TicketIcon },
              { id: "analytics", label: "Analytics", icon: ChartBarIcon },
              { id: "settings", label: "Settings", icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-300 relative group ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                
                {/* Active tab indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ${
                  activeTab === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}></div>
                
                {/* Hover background */}
                <div className="absolute inset-0 bg-blue-50 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-20"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Flight Operations Center</h2>
                  <p className="text-blue-100 text-lg mb-4">Managing excellence in aviation ✈️</p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>All Systems Operational</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <PaperAirplaneIcon className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <PaperAirplaneIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Flights</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalFlights}</p>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <TicketIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">৳{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Occupancy</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.averageOccupancy.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Flights */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">Recent Flights</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all duration-200">
                    <span>View All</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {flights.slice(0, 3).map((flight) => (
                    <div key={flight.id} className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-200">
                          <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{flight.flightNumber}</p>
                          <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <span>{flight.from}</span>
                            <ArrowRightIcon className="w-3 h-3" />
                            <span>{flight.to}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{flight.bookedSeats}/{flight.totalSeats} seats</p>
                        <p className="text-sm font-semibold text-blue-600">৳{flight.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "flights" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">Flight Management</h2>
                <p className="text-gray-600 mt-1">Manage your airline's flight operations</p>
              </div>
              <button
                onClick={() => setShowAddFlight(true)}
                className="relative overflow-hidden px-6 py-3 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group focus:outline-none bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white focus:ring-4 focus:ring-blue-300/50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative flex items-center space-x-2">
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Flight</span>
                </span>
              </button>
            </div>

            {/* Flights Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Flight</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aircraft</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Occupancy</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {flights.map((flight, index) => (
                      <tr key={flight.id} className={`hover:bg-blue-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                              <PaperAirplaneIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="font-semibold text-gray-900">{flight.flightNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-gray-900">
                            <span className="font-medium">{flight.from}</span>
                            <ArrowRightIcon className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">{flight.to}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {new Date(flight.departure).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500 flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>
                                {new Date(flight.departure).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(flight.arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {flight.aircraft}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 mb-1">{flight.bookedSeats}/{flight.totalSeats}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300" 
                                style={{width: `${(flight.bookedSeats / flight.totalSeats) * 100}%`}}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-blue-600">৳{flight.price}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            flight.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {flight.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedFlight(flight);
                                setShowEditFlight(true);
                              }}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="Edit Flight"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteFlight(flight.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete Flight"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">Recent Bookings</h2>
              <p className="text-gray-600 mt-1">Monitor passenger bookings and reservations</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking Ref</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Passenger</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Flight</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {bookings.map((booking, index) => (
                      <tr key={booking.id} className={`hover:bg-blue-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-blue-600">{booking.bookingRef}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">{booking.passenger.charAt(0)}</span>
                            </div>
                            <span className="font-medium text-gray-900">{booking.passenger}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">{booking.flight}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900">{booking.route}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900">{booking.date}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-green-600">৳{booking.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">Analytics & Reports</h2>
              <p className="text-gray-600 mt-1">Business intelligence and performance metrics</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Chart */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Revenue</h3>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-center">
                    <ChartBarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Revenue chart would be displayed here</p>
                    <p className="text-sm text-gray-400 mt-2">Integration with charts library pending</p>
                  </div>
                </div>
              </div>

              {/* Flight Performance */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Flight Performance</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-700">On-time Performance</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <UserGroupIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-700">Average Load Factor</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stats.averageOccupancy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-700">Customer Satisfaction</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">4.6/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">Settings</h2>
              <p className="text-gray-600 mt-1">Manage your airline configuration and preferences</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Airline Information */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <CogIcon className="w-6 h-6 text-blue-600" />
                  <span>Airline Information</span>
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Airline Name</label>
                    <input 
                      type="text" 
                      value={airlineName}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Name</label>
                    <input 
                      type="text" 
                      value={adminName}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
                      readOnly
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold">
                    Update Information
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-red-200/50">
                <h3 className="text-xl font-bold text-red-600 mb-6 flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  <span>Danger Zone</span>
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 mb-3">
                      <strong>Warning:</strong> These actions cannot be undone. Please proceed with caution.
                    </p>
                    <div className="space-y-3">
                      <button className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold">
                        Delete All Flight Data
                      </button>
                      <button className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold">
                        Reset Airline Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddFlight && (
        <FlightForm
          onSubmit={handleAddFlight}
          onCancel={() => setShowAddFlight(false)}
          title="Add New Flight"
        />
      )}

      {showEditFlight && selectedFlight && (
        <FlightForm
          flight={selectedFlight}
          onSubmit={handleEditFlight}
          onCancel={() => {
            setShowEditFlight(false);
            setSelectedFlight(null);
          }}
          title="Edit Flight"
        />
      )}
    </div>
  );
}

export default AdminDashboard;
