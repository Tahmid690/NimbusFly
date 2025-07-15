// src/component/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './../Authnication/AdminContext'; // Adjust this path if needed
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus } from 'lucide-react';

// Import local components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/Dashboard/OverviewTab';
import BookingsTab from './components/Bookings/BookingsTab';
import FlightsTab from './components/Flights/FlightsTab';
import AircraftTab from './components/Aircraft/AircraftTab';
import PassengersTab from './components/Passengers/PassengersTab';
import SettingsTab from './components/Settings/SettingsTab';

const AdminDashboard = () => {
  const { admin, logout, isAuthenticated, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('lastActiveTab');
    if (savedTab) {
      localStorage.removeItem('lastActiveTab'); // Remove after reading
      return savedTab;
    }
    return 'overview';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Data State
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingFlights, setUpcomingFlights] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [allAircraft, setAllAircraft] = useState([]);
  const [airlineLogo, setAirlineLogo] = useState(null);
  

  // Redirect if not authenticated
  useEffect(() => {
    if (!adminLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, adminLoading, navigate]);

  // Generic Data Fetcher
  const fetchData = useCallback(async (endpoint, setter, dataKey = 'data') => {
    if (!admin?.airline_id) return;
    try {
      setDataLoading(true);
      const response = await axios.get(`http://localhost:3000${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.data.success) {
        setter(response.data[dataKey] || []);
        setError(null);
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(`Failed to load data.`);
      setter([]);
    } finally {
      setDataLoading(false);
    }
  }, [admin?.airline_id]);

  // Initial Data Load for Overview
  useEffect(() => {
    if (admin?.airline_id) {
      setDataLoading(true);
      Promise.all([
        fetchData(`/admin/analytics/${admin.airline_id}`, (data) => {
          setAnalytics(data.stats || {});
          setRecentBookings(data.recentBookings || []);
          setUpcomingFlights(data.upcomingFlights || []);
        }, 'data'),
        fetchData(`/airlines/${admin.airline_id}`, (data) => setAirlineLogo(data.logo_url), 'data')
      ]).finally(() => {
        setDataLoading(false);
        setLastUpdated(new Date());
      });
    }
  }, [admin, fetchData]);
  
  // Tab-specific data fetching
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'bookings':
        if (allBookings.length === 0) fetchData(`/admin/bookings/${admin.airline_id}`, setAllBookings);
        break;
      case 'flights':
        if (allFlights.length === 0) fetchData(`/admin/flights/${admin.airline_id}`, setAllFlights);
        break;
      case 'aircraft':
        if (allAircraft.length === 0) fetchData(`/aircraft/airline/${admin.airline_id}`, setAllAircraft);
        break;
      case 'passengers':
        if (allBookings.length === 0) fetchData(`/admin/bookings/${admin.airline_id}`, setAllBookings);
        break;
      default:
        break;
    }
  }, [admin, allBookings.length, allFlights.length, allAircraft.length, fetchData]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  const renderContent = () => {
    if (dataLoading && activeTab !== 'overview') { // Show loader for tabs fetching data
      return <div className="text-center p-10">Loading Data...</div>;
    }
    
    switch (activeTab) {
      case 'overview':
        return <OverviewTab analytics={analytics} bookings={recentBookings} flights={upcomingFlights} dataLoading={dataLoading} error={error} lastUpdated={lastUpdated} />;
      case 'bookings':
        return <BookingsTab allBookings={allBookings} />;
      case 'flights':
        return <FlightsTab allFlights={allFlights} />;
      case 'aircraft':
        return <AircraftTab allAircraft={allAircraft} admin={admin} />;
      case 'passengers':
        return <PassengersTab allBookings={allBookings} />;
      case 'settings':
        return <SettingsTab admin={admin} />;
      default:
        return <div className="p-8"><h2 className="text-2xl">Select a tab</h2></div>;
    }
  };

  if (adminLoading || !isAuthenticated || !admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-200">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        airlineLogo={airlineLogo}
        admin={admin}
        handleLogout={handleLogout}
      />
      <div className="flex relative z-30">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
        />
        <main className="flex-1 p-8 overflow-y-auto" style={{maxHeight: 'calc(100vh - 96px)'}}>
          {renderContent()}
        </main>
      </div>
      
    </div>
  );
};

export default AdminDashboard;