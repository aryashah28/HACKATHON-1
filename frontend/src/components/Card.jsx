import React from 'react';

export default function Card({ title, value, icon, className = '' }) {
  return (
    <div className={`glass-card-light shadow-lg hover:shadow-xl transition backdrop-blur-xl p-5 rounded-2xl w-full ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-gray-300">{title}</h3>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mt-2 text-gray-50">{value}</p>
    </div>
  );
}