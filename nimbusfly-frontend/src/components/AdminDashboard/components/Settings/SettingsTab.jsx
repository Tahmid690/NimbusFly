// src/component/AdminDashboard/components/Settings/SettingsTab.jsx
import React from 'react';
import GlowCard from '../UI/GlowCard';
import { Shield, User, Globe } from 'lucide-react';

const SettingsTab = ({ admin }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
        Settings & Configuration
      </h2>
      <p className="text-gray-600 text-lg">System preferences and airline configuration</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <GlowCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Airline Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Airline Name</label>
            <input
              type="text"
              value={admin.airline_name || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              value={admin.email || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin ID</label>
            <input
              type="text"
              value={admin.admin_id || admin.id || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
        </div>
      </GlowCard>

      <GlowCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">System Preferences</h3>
        <div className="space-y-4">
          {/* Add your toggle switches here */}
        </div>
      </GlowCard>
    </div>

    <GlowCard className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Security & Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">Security Status</h4>
          <p className="text-sm text-green-600 font-medium">Fully Secured</p>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">Admin Access</h4>
          <p className="text-sm text-blue-600 font-medium">Full Privileges</p>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">Data Backup</h4>
          <p className="text-sm text-purple-600 font-medium">Auto-sync Enabled</p>
        </div>
      </div>
    </GlowCard>
  </div>
);

export default SettingsTab;