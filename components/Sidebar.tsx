
import React from 'react';
import { Page } from '../App';
import { LayoutDashboard, Users, Package, Factory, Warehouse, Truck, landmark, Briefcase, FileText } from 'lucide-react';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'raw_materials', label: 'Raw Materials', icon: Package },
  { id: 'production_process', label: 'Production', icon: Factory },
  { id: 'stock', label: 'Stock', icon: Warehouse },
  { id: 'shipments', label: 'Shipments', icon: Truck },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800 text-gray-100">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <Factory className="h-8 w-8 text-blue-400" />
        <span className="ml-2 text-xl font-bold">AMS HRMS</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.id as Page);
            }}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activePage === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
