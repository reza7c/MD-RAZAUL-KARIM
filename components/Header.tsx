
import React from 'react';
import { Bell, User } from 'lucide-react';

const Header: React.FC = () => {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Al Munif Sewing HRMS</h1>
            <p className="text-sm text-gray-500">{today}</p>
        </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-6 w-6 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <User className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
