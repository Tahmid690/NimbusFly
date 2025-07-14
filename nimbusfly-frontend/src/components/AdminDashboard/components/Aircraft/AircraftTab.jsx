// src/component/AdminDashboard/components/Aircraft/AircraftTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import AircraftTable from './AircraftTable';
import StatCard from '../Dashboard/StatCard';
import { Plus, Plane, Wrench, CheckCircle, AlertTriangle, Download, Filter } from 'lucide-react';

const AircraftTab = ({ allAircraft, searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const aircraftPerPage = 15;

  // Calculate aircraft statistics
  const aircraftStats = useMemo(() => {
    if (!allAircraft.length) return {};
    
    const operational = allAircraft.filter(a => a.status === 'operational');
    const maintenance = allAircraft.filter(a => a.status === 'maintenance');
    const grounded = allAircraft.filter(a => a.status === 'grounded');
    const avgCapacity = allAircraft.reduce((sum, a) => sum + (a.capacity || 0), 0) / allAircraft.length;
    const totalCapacity = allAircraft.reduce((sum, a) => sum + (a.capacity || 0), 0);
    
    return {
      totalAircraft: allAircraft.length,
      operational: operational.length,
      maintenance: maintenance.length,
      grounded: grounded.length,
      avgCapacity: Math.round(avgCapacity),
      totalCapacity,
      operationalRate: ((operational.length / allAircraft.length) * 100).toFixed(1)
    };
  }, [allAircraft]);

  const filteredAircraft = useMemo(() => {
    let filtered = allAircraft;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(aircraft => aircraft.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plane =>
        (plane.model && plane.model.toLowerCase().includes(query)) ||
        (plane.registration_number && plane.registration_number.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [allAircraft, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedAircraft = useMemo(() => {
    const startIndex = (currentPage - 1) * aircraftPerPage;
    return filteredAircraft.slice(startIndex, startIndex + aircraftPerPage);
  }, [filteredAircraft, currentPage, aircraftPerPage]);

  const totalPages = Math.ceil(filteredAircraft.length / aircraftPerPage);

  const stats = [
    {
      label: 'Total Aircraft',
      value: aircraftStats.totalAircraft?.toLocaleString() || '0',
      change: `${aircraftStats.operationalRate || 0}% operational`,
      trend: aircraftStats.operational > aircraftStats.maintenance ? 'up' : 'neutral',
      icon: Plane,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Fleet size',
      percentage: `${aircraftStats.operationalRate || 0}%`
    },
    {
      label: 'Operational',
      value: aircraftStats.operational?.toLocaleString() || '0',
      change: `${aircraftStats.maintenance || 0} in maintenance`,
      trend: aircraftStats.operational > aircraftStats.maintenance ? 'up' : 'neutral',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Ready for service',
      percentage: `${((aircraftStats.operational / (aircraftStats.totalAircraft || 1)) * 100).toFixed(1)}%`
    },
    {
      label: 'Maintenance',
      value: aircraftStats.maintenance?.toLocaleString() || '0',
      change: `${aircraftStats.grounded || 0} grounded`,
      trend: aircraftStats.maintenance > 0 ? 'down' : 'neutral',
      icon: Wrench,
      gradient: 'from-yellow-500 to-orange-600',
      description: 'Under maintenance',
      percentage: `${((aircraftStats.maintenance / (aircraftStats.totalAircraft || 1)) * 100).toFixed(1)}%`
    },
    {
      label: 'Total Capacity',
      value: aircraftStats.totalCapacity?.toLocaleString() || '0',
      change: `${aircraftStats.avgCapacity || 0} avg capacity`,
      trend: aircraftStats.totalCapacity > 0 ? 'up' : 'neutral',
      icon: AlertTriangle,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Passenger capacity',
      percentage: '+100%'
    }
  ];

  return (
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
            onClick={() => alert('Exporting aircraft data...')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Export</span>
          </button>
          <button
            onClick={() => alert('Add Aircraft feature coming soon!')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Add Aircraft</span>
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
          <option value="all">All Aircraft</option>
          <option value="operational">Operational</option>
          <option value="maintenance">Maintenance</option>
          <option value="grounded">Grounded</option>
        </select>
        <span className="text-gray-600 text-sm">Showing {filteredAircraft.length} of {allAircraft.length} aircraft</span>
      </div>

      <GlowCard>
        <AircraftTable
          aircraft={paginatedAircraft}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={filteredAircraft.length}
          itemsPerPage={aircraftPerPage}
          searchQuery={searchQuery}
        />
      </GlowCard>
    </div>
  );
};

export default AircraftTab;