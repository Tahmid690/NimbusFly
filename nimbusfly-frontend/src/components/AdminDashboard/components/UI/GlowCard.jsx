// src/component/AdminDashboard/components/UI/GlowCard.jsx
import React from 'react';

const GlowCard = ({ children, className = "" }) => (
  <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300 ${className}`}
       style={{
         boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.3)`,
       }}>
    {children}
  </div>
);

export default GlowCard;