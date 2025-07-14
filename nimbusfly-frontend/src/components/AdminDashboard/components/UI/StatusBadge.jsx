// src/component/AdminDashboard/components/UI/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const configs = {
    'Confirmed': { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', glow: 'shadow-emerald-500/25' },
    'confirmed': { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', glow: 'shadow-emerald-500/25' },
    'Pending': { bg: 'bg-gradient-to-r from-amber-500 to-orange-600', glow: 'shadow-amber-500/25' },
    'pending': { bg: 'bg-gradient-to-r from-amber-500 to-orange-600', glow: 'shadow-amber-500/25' },
    'Cancelled': { bg: 'bg-gradient-to-r from-red-500 to-rose-600', glow: 'shadow-red-500/25' },
    'cancelled': { bg: 'bg-gradient-to-r from-red-500 to-rose-600', glow: 'shadow-red-500/25' },
    'On Time': { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', glow: 'shadow-emerald-500/25' },
    'Scheduled': { bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', glow: 'shadow-blue-500/25' },
    'scheduled': { bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', glow: 'shadow-blue-500/25' },
    'Active': { bg: 'bg-gradient-to-r from-green-500 to-emerald-600', glow: 'shadow-green-500/25' },
    'active': { bg: 'bg-gradient-to-r from-green-500 to-emerald-600', glow: 'shadow-green-500/25' },
    'Delayed': { bg: 'bg-gradient-to-r from-red-500 to-rose-600', glow: 'shadow-red-500/25' },
    'Boarding': { bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', glow: 'shadow-blue-500/25' }
  };

  const config = configs[status] || { bg: 'bg-gray-500', glow: 'shadow-gray-500/25' };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${config.bg} ${config.glow}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;