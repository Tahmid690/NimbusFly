// src/component/AdminDashboard/components/Passengers/PassengersTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import PassengersList from './PassengersList';
import StatCard from '../Dashboard/StatCard';
import { Users, UserCheck, UserX, Clock, Download, Filter } from 'lucide-react';

const PassengersTab = ({ allBookings, searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const passengersPerPage = 15;

  // Calculate passenger statistics
  const passengerStats = useMemo(() => {
    if (!allBookings.length) return {};
    
    const uniquePassengers = new Set();
    const confirmedPassengers = new Set();
    const pendingPassengers = new Set();
    const cancelledPassengers = new Set();
    
    allBookings.forEach(booking => {
      if (booking.customer_email) {
        uniquePassengers.add(booking.customer_email);
        if (booking.payment_status === 'confirmed') {
          confirmedPassengers.add(booking.customer_email);
        } else if (booking.payment_status === 'pending') {
          pendingPassengers.add(booking.customer_email);
        } else if (booking.payment_status === 'cancelled') {
          cancelledPassengers.add(booking.customer_email);
        }
      }
    });
    
    const totalRevenue = allBookings
      .filter(b => b.payment_status === 'confirmed')
      .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
    
    const avgSpending = totalRevenue / (confirmedPassengers.size || 1);
    
    return {
      totalPassengers: uniquePassengers.size,
      confirmedPassengers: confirmedPassengers.size,
      pendingPassengers: pendingPassengers.size,
      cancelledPassengers: cancelledPassengers.size,
      totalBookings: allBookings.length,
      avgSpending,
      returningCustomers: Math.round(uniquePassengers.size * 0.3) // Estimate
    };
  }, [allBookings]);

  // Passengers are derived from the bookings list
  const filteredPassengers = useMemo(() => {
    let filtered = allBookings;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        (booking.customer_name && booking.customer_name.toLowerCase().includes(query)) ||
        (booking.customer_email && booking.customer_email.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [allBookings, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedPassengers = useMemo(() => {
    const startIndex = (currentPage - 1) * passengersPerPage;
    return filteredPassengers.slice(startIndex, startIndex + passengersPerPage);
  }, [filteredPassengers, currentPage, passengersPerPage]);

  const totalPages = Math.ceil(filteredPassengers.length / passengersPerPage);

  const stats = [
    {
      label: 'Total Passengers',
      value: passengerStats.totalPassengers?.toLocaleString() || '0',
      change: `${passengerStats.returningCustomers || 0} returning`,
      trend: passengerStats.returningCustomers > 0 ? 'up' : 'neutral',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Unique customers',
      percentage: passengerStats.returningCustomers && passengerStats.totalPassengers ? `${((passengerStats.returningCustomers / passengerStats.totalPassengers) * 100).toFixed(1)}%` : '0%'
    },
    {
      label: 'Confirmed',
      value: passengerStats.confirmedPassengers?.toLocaleString() || '0',
      change: `${((passengerStats.confirmedPassengers / (passengerStats.totalPassengers || 1)) * 100).toFixed(1)}% rate`,
      trend: passengerStats.confirmedPassengers > passengerStats.pendingPassengers ? 'up' : 'neutral',
      icon: UserCheck,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Confirmed bookings',
      percentage: `${((passengerStats.confirmedPassengers / (passengerStats.totalPassengers || 1)) * 100).toFixed(1)}%`
    },
    {
      label: 'Pending',
      value: passengerStats.pendingPassengers?.toLocaleString() || '0',
      change: `${passengerStats.cancelledPassengers || 0} cancelled`,
      trend: passengerStats.pendingPassengers > 0 ? 'up' : 'neutral',
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-600',
      description: 'Pending bookings',
      percentage: `${((passengerStats.pendingPassengers / (passengerStats.totalPassengers || 1)) * 100).toFixed(1)}%`
    },
    {
      label: 'Avg. Spending',
      value: `$${passengerStats.avgSpending?.toFixed(2) || '0'}`,
      change: `${passengerStats.totalBookings || 0} total bookings`,
      trend: passengerStats.avgSpending > 0 ? 'up' : 'neutral',
      icon: UserX,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Per customer',
      percentage: '+100%'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            Passenger Management
          </h2>
          <p className="text-gray-600 text-lg">Customer database and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => alert('Exporting passenger data...')}
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
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Passengers</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-gray-600 text-sm">Showing {filteredPassengers.length} of {allBookings.length} passengers</span>
      </div>

      <GlowCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">All Passengers</h3>
        <PassengersList
          passengers={paginatedPassengers}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={filteredPassengers.length}
          itemsPerPage={passengersPerPage}
          searchQuery={searchQuery}
        />
      </GlowCard>
    </div>
  );
};

export default PassengersTab;