import React from 'react';
import { Page } from '../App';
import { LayoutDashboard, Users, Package, Factory, Warehouse, Truck } from 'lucide-react';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'raw_materials', label: 'Raw Materials', icon: Package },
  { id: 'production_process', label: 'Production', icon: Factory },
  { id: 'stock', label: 'Stock', icon: Warehouse },
  { id: 'shipments', label: 'Shipments', icon: Truck },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setOpen }) => {
  const handleLinkClick = (page: Page) => {
    setActivePage(page);
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Factory className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">AMS HRMS</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id as Page);
              }}
              className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span className="nav-text">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={() => setOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
