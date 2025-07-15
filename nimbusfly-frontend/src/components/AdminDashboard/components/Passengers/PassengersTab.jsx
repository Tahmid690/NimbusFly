// src/component/AdminDashboard/components/Passengers/PassengersTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import GlowCard from '../UI/GlowCard';
import PassengersList from './PassengersList';
import StatCard from '../Dashboard/StatCard';
import { useAdminAuth } from '../../../Authnication/AdminContext'; 
import axios from 'axios';
import { Users, UserCheck, UserX, Clock, Download, Filter } from 'lucide-react';

const PassengersTab = ({ allBookings, searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [allpassengers,setPassengers]=useState([]);
  const passengersPerPage = 15;
  const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
  console.log(admin);
 // console.log("All bookings : ",allBookings);
  // Calculate passenger statistics

      useEffect(() => {
  if (!admin?.airline_id) return;         // wait until we have an airline ID

  const fetchPassengers = async () => {
    try {
      const  response  = await axios.get(
        `http://localhost:3000/admin/getpassenger/${admin.airline_id}`, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      setPassengers(response.data.data); 
     console.log(response.data.data);                // use the JSON payload
    } catch (err) {
      console.error('Failed to load passengers', err);
    }
  };

  fetchPassengers();
}, [admin.airline_id]); 




  // Passengers are derived from the bookings list


  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedPassengers = useMemo(() => {
    const startIndex = (currentPage - 1) * passengersPerPage;
    return allpassengers.slice(startIndex, startIndex + passengersPerPage);
  }, [allpassengers, currentPage, passengersPerPage]);

  const totalPages = Math.ceil(allpassengers.length / passengersPerPage);

  const stats = [
    {
      label: 'Total Passengers',
      value: allpassengers.length.toLocaleString() || '0',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Unique customers',
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

      <GlowCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">All Passengers</h3>
        <PassengersList
          passengers={paginatedPassengers}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={allpassengers.length}
          itemsPerPage={passengersPerPage}
          searchQuery={searchQuery}
        />
      </GlowCard>
    </div>
  );
};

export default PassengersTab;