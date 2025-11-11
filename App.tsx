
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import ProductionProcess from './pages/ProductionProcess';
import RawMaterials from './pages/RawMaterials';
import Stock from './pages/Stock';
import Shipments from './pages/Shipments';

export type Page = 'dashboard' | 'employees' | 'raw_materials' | 'production_process' | 'stock' | 'shipments' | 'payroll' | 'payments';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');

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

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
