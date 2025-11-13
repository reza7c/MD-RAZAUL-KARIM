import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import ProductionProcess from './pages/ProductionProcess';
import RawMaterials from './pages/RawMaterials';
import Stock from './pages/Stock';
import Shipments from './pages/Shipments';
import './styles.css';

export type Page = 'dashboard' | 'employees' | 'raw_materials' | 'production_process' | 'stock' | 'shipments' | 'payroll' | 'payments';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Employees />;
      case 'raw_materials':
        return <RawMaterials />;
      case 'production_process':
        return <ProductionProcess />;
      case 'stock':
        return <Stock />;
      case 'shipments':
        return <Shipments />;
      default:
        return <Dashboard />;
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={isSidebarOpen}
        setOpen={setSidebarOpen}
      />
      <div className="main-content">
        <Header onMenuClick={toggleSidebar} />
        <main className="content-area">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
