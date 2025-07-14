// src/component/AdminDashboard/components/Bookings/BookingsTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import BookingsTable from './BookingsTable';
import BookingDetailsModal from './BookingDetailsModal';
import StatCard from '../Dashboard/StatCard';
import { DollarSign, Calendar, CheckCircle, Clock, Download, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BookingsTab = ({ allBookings, searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookings, setBookings] = useState(allBookings || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const bookingsPerPage = 20;

  // Update bookings when allBookings prop changes
  useEffect(() => {
    setBookings(allBookings || []);
  }, [allBookings]);

  // Fetch bookings from backend
  const fetchBookings = async (page = 1, status = 'all', search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: bookingsPerPage.toString(),
      });
      
      if (status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const response = await axios.get(`http://localhost:3000/admin/admin/bookings?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      if (response.data.success) {
        setBookings(response.data.data);
        return response.data.pagination;
      } else {
        setError('Failed to fetch bookings');
        return null;
      }
    } catch (err) {
      setError('Error fetching bookings');
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshBookings = async () => {
    setRefreshing(true);
    await fetchBookings(currentPage, statusFilter, searchQuery);
    setRefreshing(false);
  };

  // Calculate booking statistics
  const bookingStats = useMemo(() => {
    if (!bookings.length) return {};
    
    const confirmedBookings = bookings.filter(b => b.payment_status === 'PAID' || b.payment_status === 'confirmed');
    const pendingBookings = bookings.filter(b => b.payment_status === 'UNPAID' || b.payment_status === 'pending');
    const cancelledBookings = bookings.filter(b => b.payment_status === 'CANCELLED' || b.payment_status === 'cancelled');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
    const todayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.created_at || b.booking_date);
      const today = new Date();
      return bookingDate.toDateString() === today.toDateString();
    });
    
    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      pendingBookings: pendingBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalRevenue,
      todayBookings: todayBookings.length,
      avgBookingValue: totalRevenue / (confirmedBookings.length || 1)
    };
  }, [bookings]);

  // Handle booking actions
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/admin/admin/booking/${bookingId}/status`,
        { payment_status: newStatus },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      
      if (response.data.success) {
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.booking_id === bookingId 
            ? { ...booking, payment_status: newStatus }
            : booking
        ));
        
        // Show success message
        alert('Booking status updated successfully');
      } else {
        alert('Failed to update booking status');
      }
    } catch (err) {
      alert('Error updating booking status');
      console.error('Error:', err);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchBookings(1, newStatus, searchQuery);
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/admin/admin/bookings/export`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exporting data');
      console.error('Error:', err);
    }
  };

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      let filterValue = statusFilter;
      if (statusFilter === 'confirmed') filterValue = 'PAID';
      if (statusFilter === 'pending') filterValue = 'UNPAID';
      if (statusFilter === 'cancelled') filterValue = 'CANCELLED';
      filtered = filtered.filter(booking => booking.payment_status === filterValue || booking.payment_status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.customer_name && booking.customer_name.toLowerCase().includes(query)) ||
        (booking.booking_id && booking.booking_id.toString().includes(query)) ||
        (booking.payment_status && booking.payment_status.toLowerCase().includes(query)) ||
        (booking.customer_email && booking.customer_email.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [bookings, searchQuery, statusFilter]);
  
  // Reset page to 1 when search query changes
  React.useEffect(() => {
      setCurrentPage(1);
  }, [searchQuery]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * bookingsPerPage;
    return filteredBookings.slice(startIndex, startIndex + bookingsPerPage);
  }, [filteredBookings, currentPage, bookingsPerPage]);

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const stats = [
    {
      label: 'Total Bookings',
      value: bookingStats.totalBookings?.toLocaleString() || '0',
      change: `+${bookingStats.todayBookings || 0} today`,
      trend: bookingStats.todayBookings > 0 ? 'up' : 'neutral',
      icon: Calendar,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'All reservations',
      percentage: bookingStats.todayBookings && bookingStats.totalBookings ? `+${((bookingStats.todayBookings / bookingStats.totalBookings) * 100).toFixed(1)}%` : '+0%'
    },
    {
      label: 'Confirmed',
      value: bookingStats.confirmedBookings?.toLocaleString() || '0',
      change: `${bookingStats.pendingBookings || 0} pending`,
      trend: bookingStats.confirmedBookings > (bookingStats.pendingBookings + bookingStats.cancelledBookings) ? 'up' : 'neutral',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Confirmed bookings',
      percentage: `${((bookingStats.confirmedBookings / (bookingStats.totalBookings || 1)) * 100).toFixed(1)}%`
    },
    {
      label: 'Cancelled',
      value: bookingStats.cancelledBookings?.toLocaleString() || '0',
      change: `${((bookingStats.cancelledBookings / (bookingStats.totalBookings || 1)) * 100).toFixed(1)}% rate`,
      trend: bookingStats.cancelledBookings > 0 ? 'down' : 'neutral',
      icon: Clock,
      gradient: 'from-red-500 to-pink-600',
      description: 'Cancelled bookings',
      percentage: `${((bookingStats.cancelledBookings / (bookingStats.totalBookings || 1)) * 100).toFixed(1)}%`
    },
    {
      label: 'Revenue',
      value: `$${bookingStats.totalRevenue?.toLocaleString() || '0'}`,
      change: `$${bookingStats.avgBookingValue?.toFixed(2) || '0'} avg`,
      trend: bookingStats.totalRevenue > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Total revenue',
      percentage: '+100%'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            Booking Management
          </h2>
          <p className="text-gray-600 text-lg">Advanced reservation control system</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshBookings}
            disabled={refreshing}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl hover:from-green-700 hover:to-teal-700 flex items-center space-x-2 shadow-lg shadow-green-500/25 transition-all duration-300"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-semibold">Refresh</span>
          </button>
          <button
            onClick={handleExportData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Export</span>
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
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Bookings</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-gray-600 text-sm">Showing {filteredBookings.length} of {bookings.length} bookings</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <GlowCard>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : (
          <BookingsTable 
            bookings={paginatedBookings}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
            totalItems={filteredBookings.length}
            itemsPerPage={bookingsPerPage}
            searchQuery={searchQuery}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </GlowCard>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
        onStatusUpdate={(bookingId, newStatus) => {
          // Update local state
          setBookings(prev => prev.map(booking => 
            booking.booking_id === bookingId 
              ? { ...booking, payment_status: newStatus }
              : booking
          ));
        }}
      />
    </div>
  );
};

export default BookingsTab;