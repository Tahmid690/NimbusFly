import React, { useState, useEffect } from 'react';
import { useAuth } from './Authnication/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { 
  Calendar, 
  MapPin, 
  Plane, 
  User, 
  LogOut, 
  Search, 
  Download,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Eye,
  Edit3,
  Mail,
  Phone,
  X,
  Clock,
  Users
} from 'lucide-react';

const UserDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user bookings
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (user?.customer_id) {
          const response = await axios.get(`http://localhost:3000/bookings/customer/${user.customer_id}`);
          if (response.data.success) {
            setBookings(response.data.data || []);
          } else {
            setError('Failed to load bookings');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.message || 'Failed to load your bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch detailed booking information
  const fetchBookingDetails = async (bookingId) => {
    try {
      setBookingDetailsLoading(true);
      const response = await axios.get(`http://localhost:3000/bookings/${bookingId}/details`);
      if (response.data.success) {
        setSelectedBooking(response.data.data);
        setShowBookingDetails(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      alert('Failed to load booking details. Please try again.');
    } finally {
      setBookingDetailsLoading(false);
    }
  };

  // Handle download ticket functionality
  const handleDownloadTicket = async (bookingId) => {
    try {
      console.log('Downloading ticket for booking ID:', bookingId);
      setBookingDetailsLoading(true);
      
      // Fetch booking details
      const response = await axios.get(`http://localhost:3000/bookings/${bookingId}/details`);
      if (!response.data.success) {
        alert('Failed to load booking data for ticket generation.');
        return;
      }
      
      const bookingData = response.data.data;
      
      // Generate and download PDF directly
      await generateBoardingPassPDF(bookingData);
      
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    } finally {
      setBookingDetailsLoading(false);
    }
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setProfileForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone_number || user.phone || '',
      address: user.address || ''
    });
    setShowEditProfile(true);
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setEditingProfile(true);
    
    try {
      const response = await axios.put(`http://localhost:3000/customer/${user.customer_id}/profile`, {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        phone_number: profileForm.phone,
        address: profileForm.address
      });
      
      if (response.data.success) {
        alert('Profile updated successfully!');
        setShowEditProfile(false);
        // Optionally refresh user data or update context
      } else {
        alert(response.data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      alert(errorMessage);
    } finally {
      setEditingProfile(false);
    }
  };

  // Generate boarding pass PDF directly
  const generateBoardingPassPDF = async (bookingData) => {
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Group tickets by passenger to avoid duplicates
      const passengerMap = new Map();
      bookingData.tickets.forEach(ticket => {
        const passengerKey = `${ticket.passenger_first_name}_${ticket.passenger_last_name}`;
        if (!passengerMap.has(passengerKey)) {
          passengerMap.set(passengerKey, {
            first_name: ticket.passenger_first_name,
            last_name: ticket.passenger_last_name,
            seat_class: ticket.seat_class,
            seat_number: ticket.seat_number,
            passport_number: ticket.passport_number,
            ticket: ticket
          });
        }
      });
      
      const passengers = Array.from(passengerMap.values());
      
      // Group tickets by flight
      const flightMap = new Map();
      bookingData.tickets.forEach(ticket => {
        const flightKey = ticket.flight_number;
        if (!flightMap.has(flightKey)) {
          flightMap.set(flightKey, {
            flight_number: ticket.flight_number,
            airline_name: ticket.airline_name,
            departure_time: ticket.departure_time,
            arrival_time: ticket.arrival_time,
            origin_airport: ticket.origin_airport,
            destination_airport: ticket.destination_airport,
            origin_code: ticket.origin_code,
            destination_code: ticket.destination_code,
            aircraft_model: ticket.aircraft_model
          });
        }
      });
      
      const flights = Array.from(flightMap.values());
      
      // Generate boarding passes for each passenger and each flight
      for (let flightIndex = 0; flightIndex < flights.length; flightIndex++) {
        const flight = flights[flightIndex];
        
        for (let passengerIndex = 0; passengerIndex < passengers.length; passengerIndex++) {
          const passenger = passengers[passengerIndex];
          const isNewPage = !(flightIndex === 0 && passengerIndex === 0);
          
          if (isNewPage) {
            pdf.addPage();
          }
          
          // Generate QR code for this passenger and flight
          const qrData = JSON.stringify({
            booking: bookingData.booking.booking_id,
            flight: flight.flight_number,
            passenger: `${passenger.first_name} ${passenger.last_name}`,
            seat: passenger.seat_number || 'TBD'
          });
          
          const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 80,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Create boarding pass HTML
          const boardingPassHTML = `
            <div style="width: 900px; height: 500px; background: white; font-family: Arial, sans-serif; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: flex;">
              <!-- Left section - Main boarding pass -->
              <div style="flex: 3; padding: 32px 24px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; position: relative;">
                
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                  <div>
                    <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 4px 0;">BOARDING PASS</h1>
                    <p style="font-size: 14px; opacity: 0.9; margin: 0;">${flight.airline_name}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="font-size: 12px; opacity: 0.8; margin: 0;">Flight</p>
                    <p style="font-size: 18px; font-weight: bold; margin: 0;">${flight.flight_number}</p>
                  </div>
                </div>
        
                <!-- Passenger Info -->
                <div style="margin-bottom: 24px;">
                  <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">${passenger.first_name.toUpperCase()} ${passenger.last_name.toUpperCase()}</h2>
                  <p style="font-size: 14px; opacity: 0.9; margin: 0;">Passenger</p>
                </div>
        
                <!-- Flight Route -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                  <div style="text-align: center;">
                    <p style="font-size: 12px; opacity: 0.8; margin: 0 0 4px 0;">FROM</p>
                    <p style="font-size: 24px; font-weight: bold; margin: 0;">${flight.origin_code}</p>
                    <p style="font-size: 10px; opacity: 0.7; margin: 4px 0 0 0;">${flight.origin_airport}</p>
                  </div>
                  <div style="flex: 1; height: 2px; background: rgba(255,255,255,0.3); margin: 0 20px; position: relative;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: #3b82f6; font-size: 16px;">✈</span>
                    </div>
                  </div>
                  <div style="text-align: center;">
                    <p style="font-size: 12px; opacity: 0.8; margin: 0 0 4px 0;">TO</p>
                    <p style="font-size: 24px; font-weight: bold; margin: 0;">${flight.destination_code}</p>
                    <p style="font-size: 10px; opacity: 0.7; margin: 4px 0 0 0;">${flight.destination_airport}</p>
                  </div>
                </div>
        
                <!-- Flight Details -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                  <div>
                    <p style="font-size: 10px; opacity: 0.8; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
                    <p style="font-size: 14px; font-weight: bold; margin: 0;">${new Date(flight.departure_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style="font-size: 10px; opacity: 0.8; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Departure</p>
                    <p style="font-size: 14px; font-weight: bold; margin: 0;">${new Date(flight.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                  </div>
                  <div>
                    <p style="font-size: 10px; opacity: 0.8; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Seat</p>
                    <p style="font-size: 14px; font-weight: bold; margin: 0;">${passenger.seat_number || 'TBD'}</p>
                  </div>
                  <div>
                    <p style="font-size: 10px; opacity: 0.8; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Class</p>
                    <p style="font-size: 14px; font-weight: bold; margin: 0;">${passenger.seat_class}</p>
                  </div>
                </div>
        
                <!-- Bottom info -->
                <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="font-size: 10px; opacity: 0.8; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px;">Boarding Time</p>
                    <p style="font-size: 14px; font-weight: bold; margin: 0;">30 min before</p>
                  </div>
                  <div>
                    <p style="font-size: 10px; opacity: 0.8; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px;">Gate</p>
                    <p style="font-size: 14px; font-weight: bold; margin: 0;">TBD</p>
                  </div>
                </div>
              </div>
              
              <!-- Right section - Stub -->
              <div style="flex: 1; padding: 32px 20px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; position: relative; border-left: 2px dashed #cbd5e1;">
                
                <!-- Header -->
                <div style="width: 100%;">
                  <p style="font-size: 10px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${flight.airline_name}</p>
                  <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 4px 0;">${flight.flight_number}</p>
                </div>
        
                <!-- QR Code -->
                <div style="margin: 20px 0;">
                  <div style="padding: 8px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 80px; height: 80px; display: block;" />
                  </div>
                </div>
        
                <!-- Flight info -->
                <div style="width: 100%;">
                  <p style="font-size: 16px; font-weight: bold; color: #1e293b; margin: 0;">${flight.origin_code}</p>
                  <p style="font-size: 10px; color: #64748b; margin: 2px 0 8px 0;">TO</p>
                  <p style="font-size: 16px; font-weight: bold; color: #1e293b; margin: 0;">${flight.destination_code}</p>
                </div>
        
                <!-- Seat -->
                <div style="width: 100%;">
                  <p style="font-size: 10px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">SEAT</p>
                  <p style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 0;">${passenger.seat_number || 'TBD'}</p>
                </div>
              </div>
            </div>
          `;
          
          // Create temporary container
          const tempContainer = document.createElement('div');
          tempContainer.style.position = 'fixed';
          tempContainer.style.top = '-9999px';
          tempContainer.style.left = '0';
          tempContainer.style.width = '900px';
          tempContainer.style.height = '500px';
          tempContainer.style.zIndex = '9999';
          tempContainer.innerHTML = boardingPassHTML;
          
          document.body.appendChild(tempContainer);
          
          // Generate image and add to PDF
          const canvas = await html2canvas(tempContainer, {
            width: 900,
            height: 500,
            scale: 2,
            useCORS: true,
            allowTaint: true
          });
          
          document.body.removeChild(tempContainer);
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 280;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const x = (297 - imgWidth) / 2;
          const y = (210 - imgHeight) / 2;
          
          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        }
      }
      
      // Save the PDF
      const passengerCount = passengers.length;
      const flightCount = flights.length;
      const fileName = `BoardingPasses-${bookingData.booking.booking_id}-${passengerCount}PAX-${flightCount}Flights.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating boarding pass:', error);
      throw error;
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
                         booking.routes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.airlines?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         booking.payment_status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const upcomingFlights = bookings.filter(booking => 
    booking.earliest_departure && new Date(booking.earliest_departure) > new Date()
  ).length;

  const totalSpent = bookings.reduce((sum, booking) => sum + (parseFloat(booking.total_amount) || 0), 0);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      <Navbar flg={true} />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
                    Welcome back, {user.first_name}!
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Manage your flights and explore new destinations
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Book New Flight
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Upcoming Flights</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingFlights}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md">
                  <Plane className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'bookings', label: 'My Bookings', icon: Calendar },
                  { id: 'profile', label: 'Profile', icon: User }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-gray-900">Your Flight Bookings</h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search bookings..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading your bookings...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-12 h-12 text-red-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h4>
                      <p className="text-gray-600 mb-8">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plane className="w-12 h-12 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No matching bookings found' : 'No bookings yet'}
                      </h4>
                      <p className="text-gray-600 mb-8">
                        {searchTerm ? 'Try adjusting your search terms' : 'Start your journey by booking your first flight!'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => navigate('/')}
                          className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                          Book Your First Flight
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((booking, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                                <Plane className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  Booking #{booking.booking_id}
                                </h4>
                                <p className="text-gray-600">
                                  Booked on {formatDate(booking.booking_date)}
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
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <span className="text-gray-500">Route:</span>
                                <span className="font-medium ml-1">{booking.routes || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <span className="text-gray-500">Passengers:</span>
                                <span className="font-medium ml-1">{booking.total_passengers || 1}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Plane className="w-4 h-4 text-gray-400" />
                              <div>
                                <span className="text-gray-500">Airlines:</span>
                                <span className="font-medium ml-1">{booking.airlines || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {booking.earliest_departure && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="text-blue-700 font-medium">Departure:</span>
                                  <span className="ml-2">{formatDate(booking.earliest_departure)} at {formatTime(booking.earliest_departure)}</span>
                                </div>
                                {booking.latest_arrival && (
                                  <div>
                                    <span className="text-blue-700 font-medium">Arrival:</span>
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
                                disabled={bookingDetailsLoading}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50"
                              >
                                <Eye className="w-4 h-4" />
                                <span>{bookingDetailsLoading ? 'Loading...' : 'View Details'}</span>
                              </button>
                              <button 
                                onClick={() => handleDownloadTicket(booking.booking_id)}
                                disabled={bookingDetailsLoading}
                                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50"
                              >
                                <Download className="w-4 h-4" />
                                <span>{bookingDetailsLoading ? 'Generating...' : 'Download Ticket'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Picture and Basic Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {user.first_name} {user.last_name}
                      </h4>
                      <p className="text-gray-600 mb-4">{user.email}</p>
                      <button 
                        onClick={handleEditProfile}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        <Edit3 className="w-4 h-4 inline mr-2" />
                        Edit Profile
                      </button>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h5 className="font-semibold text-gray-900 mb-6">Contact Information</h5>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium">{user.phone_number || user.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="font-medium">{user.address || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h5 className="font-semibold text-gray-900 mb-6">Account Details</h5>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">Customer ID</p>
                              <p className="text-sm text-gray-500">{user.customer_id}</p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">Account Status</p>
                              <p className="text-sm text-gray-500">Active Member</p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleProfileSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter your address"
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingProfile}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
                >
                  {editingProfile && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>{editingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Booking Details</h2>
                <p className="text-blue-100">Booking #{selectedBooking.booking.booking_id}</p>
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

              {/* Tickets/Flights Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Plane className="w-5 h-5 mr-2" />
                  Flight Details & Passengers
                  {selectedBooking.booking.trip_type === 'round-trip' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Round Trip
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  {(() => {
                    // Group tickets by flight to show flights separately
                    const flightGroups = {};
                    selectedBooking.tickets.forEach(ticket => {
                      const flightKey = ticket.flight_number;
                      if (!flightGroups[flightKey]) {
                        flightGroups[flightKey] = {
                          flight: ticket,
                          passengers: []
                        };
                      }
                      flightGroups[flightKey].passengers.push(ticket);
                    });
                    
                    // Sort flights by departure time to ensure correct outbound/return order
                    const flights = Object.values(flightGroups).sort((a, b) => {
                      const timeA = new Date(a.flight.departure_time).getTime();
                      const timeB = new Date(b.flight.departure_time).getTime();
                      return timeA - timeB;
                    });
                    
                    console.log('Flight groups sorted by departure time:', flights.map(f => ({
                      flight_number: f.flight.flight_number,
                      departure_time: f.flight.departure_time,
                      route: `${f.flight.origin_code} → ${f.flight.destination_code}`
                    })));
                    
                    return flights.map((flightGroup, flightIndex) => {
                      const ticket = flightGroup.flight;
                      const isReturnFlight = flightIndex > 0 && selectedBooking.booking.trip_type === 'round-trip';
                      
                      console.log(`Flight ${flightIndex}: ${ticket.flight_number} - ${ticket.origin_code} → ${ticket.destination_code} - ${isReturnFlight ? 'RETURN' : 'OUTBOUND'}`);
                      
                      return (
                        <div key={flightIndex} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-white to-blue-50">
                          {/* Flight Header */}
                          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${isReturnFlight ? 'bg-green-100' : 'bg-blue-100'}`}>
                                <Plane className={`w-5 h-5 ${isReturnFlight ? 'text-green-600 rotate-180' : 'text-blue-600'}`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900">{ticket.airline_name}</h4>
                                  {isReturnFlight && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                      Return Flight
                                    </span>
                                  )}
                                  {!isReturnFlight && selectedBooking.booking.trip_type === 'round-trip' && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                      Outbound Flight
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">Flight {ticket.flight_number}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{ticket.origin_code} → {ticket.destination_code}</p>
                              <p className="text-sm text-gray-600">{ticket.aircraft_model}</p>
                            </div>
                          </div>

                          {/* Flight Times */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Departure</p>
                                <p className="font-medium">{formatDate(ticket.departure_time)} at {formatTime(ticket.departure_time)}</p>
                                <p className="text-xs text-gray-500">{ticket.origin_airport}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Arrival</p>
                                <p className="font-medium">{formatDate(ticket.arrival_time)} at {formatTime(ticket.arrival_time)}</p>
                                <p className="text-xs text-gray-500">{ticket.destination_airport}</p>
                              </div>
                            </div>
                          </div>

                          {/* Passengers for this flight */}
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <h5 className="font-medium text-gray-900">Passengers on this Flight ({flightGroup.passengers.length})</h5>
                            </div>
                            <div className="space-y-2">
                              {flightGroup.passengers.map((passenger, passengerIndex) => (
                                <div key={passengerIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="text-gray-500">Name</p>
                                    <p className="font-medium">{passenger.passenger_first_name} {passenger.passenger_last_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Seat</p>
                                    <p className="font-medium">{passenger.seat_number || 'Not assigned'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Class</p>
                                    <p className="font-medium">{passenger.seat_class}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Total Passengers: {selectedBooking.tickets.length}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowBookingDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadTicket(selectedBooking.booking.booking_id)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;