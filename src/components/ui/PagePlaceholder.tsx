import React from 'react';

export const PagePlaceholder: React.FC<{ title: string; description?: string }> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="h-20 w-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6 border border-indigo-100 shadow-sm transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 text-base text-gray-500 max-w-md mx-auto leading-relaxed italic">
        {description || `The ${title} module is currently under development. Stay tuned for exciting features and updates!`}
      </p>
      
      <div className="mt-10 flex gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          Structure Updated
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
           <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
           UI Ready
        </div>
      </div>
    </div>
  );
};
