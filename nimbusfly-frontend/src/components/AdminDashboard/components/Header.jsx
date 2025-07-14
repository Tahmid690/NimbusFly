// src/component/AdminDashboard/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Menu, User, ChevronDown, LogOut, Plane, Search } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen, airlineLogo, admin, handleLogout, searchQuery, setSearchQuery }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  return (
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
              <img src={airlineLogo} alt={`${admin.airline_name} logo`} className="w-12 h-12 object-contain" />
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

        <div className="hidden lg:flex items-center space-x-4 bg-white/60 backdrop-blur-xl rounded-2xl p-2 border border-gray-200 shadow-inner">
          <Search className="w-5 h-5 text-gray-500 ml-2" />
          <input
            type="text"
            placeholder="Search bookings, flights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none text-gray-800 placeholder-gray-500 w-80"
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-700 text-sm font-medium">{currentTime.toLocaleTimeString()}</p>
              <p className="text-gray-600 text-xs">{currentTime.toLocaleDateString()}</p>
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
                <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-2xl rounded-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-200/50">
                    <p className="text-sm font-semibold text-gray-900">{admin.airline_name}</p>
                    <p className="text-sm text-gray-600 truncate">{admin.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
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
  );
};

export default Header;