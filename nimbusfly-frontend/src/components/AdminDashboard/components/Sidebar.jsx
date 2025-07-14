// src/component/AdminDashboard/components/Sidebar.jsx
import React from 'react';
import { BarChart3, Calendar, Plane, Navigation, Users, Settings } from 'lucide-react';

const Sidebar = ({ sidebarOpen, activeTab, handleTabChange }) => {
  const tabData = {
    overview: { label: 'Dashboard', icon: BarChart3 },
    bookings: { label: 'Bookings', icon: Calendar },
    flights: { label: 'Flights', icon: Plane },
    aircraft: { label: 'Aircraft', icon: Navigation },
    passengers: { label: 'Passengers', icon: Users },
    settings: { label: 'Settings', icon: Settings },
  };

  return (
    <aside className={`${sidebarOpen ? 'w-80' : 'w-24'} bg-white/60 backdrop-blur-2xl border-r border-gray-200/50 transition-all duration-300`}>
      <nav className="p-4">
        <ul className="space-y-2">
          {Object.entries(tabData).map(([key, { label, icon: Icon }]) => (
            <li key={key}>
              <button
                onClick={() => handleTabChange(key)}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl text-left transition-all duration-300 group ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                } ${!sidebarOpen && 'justify-center'}`}
                title={label}
              >
                <div className={`p-2 rounded-xl ${activeTab === key ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'} transition-all duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
                {sidebarOpen && <span className="font-semibold text-base">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;