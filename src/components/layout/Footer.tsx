'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t bg-white px-6 py-4 flex items-center justify-between text-xs text-gray-500">
      <div className="flex items-center gap-1 font-medium">
        <span>© {new Date().getFullYear()} SaaS Framework. All rights reserved.</span>
      </div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
      </div>
    </footer>
  );
};
