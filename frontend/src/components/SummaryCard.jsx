import React from 'react';


const SummaryCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4 transition-transform hover:scale-105">
      <div className={`p-3 rounded-full ${colorClasses[color] || 'bg-slate-100 text-slate-600'}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
};

export default SummaryCard;
