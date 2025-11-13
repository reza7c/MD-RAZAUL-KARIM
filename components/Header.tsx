import React from 'react';
import { Bell, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

  return (
    <header className="header">
        <div className="header-left">
            <button className="menu-button" onClick={onMenuClick}>
                <Menu />
            </button>
            <div className="header-title-container">
                <h1 className="header-title">Al Munif Sewing HRMS</h1>
                <p className="header-subtitle">{today}</p>
            </div>
        </div>
      <div className="header-right">
        <button className="header-icon-button">
          <Bell />
        </button>
        <button className="header-icon-button">
          <User />
        </button>
      </div>
    </header>
  );
};

export default Header;
