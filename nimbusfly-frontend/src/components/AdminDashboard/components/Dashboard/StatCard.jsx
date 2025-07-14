// src/component/AdminDashboard/components/Dashboard/StatCard.jsx
import React from 'react';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';
import GlowCard from '../UI/GlowCard';

const StatCard = ({ label, value, change, trend, icon: Icon, gradient, description, percentage }) => (
  <GlowCard className="p-6 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end space-x-1">
          {trend === 'up' ? <ArrowUp className="w-4 h-4 text-emerald-500" /> : trend === 'down' ? <ArrowDown className="w-4 h-4 text-red-500" /> : <Activity className="w-4 h-4 text-gray-500" />}
          <span className={`text-sm font-semibold ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {percentage}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{change}</p>
      </div>
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-gray-400 text-xs">{description}</p>
    </div>
  </GlowCard>
);

export default StatCard;