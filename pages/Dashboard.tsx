import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { Users, Package, Factory, Truck } from 'lucide-react';
import { api } from '../services/mockApi';
import { Employee, RawMaterial, CuttingRecord, Shipment } from '../types';

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [cuttingRecords, setCuttingRecords] = useState<CuttingRecord[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empData, matData, cutData, shipData] = await Promise.all([
          api.getEmployees(),
          api.getRawMaterials(),
          api.getCuttingRecords(),
          api.getShipments(),
        ]);
        setEmployees(empData);
        setMaterials(matData);
        setCuttingRecords(cutData);
        setShipments(shipData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalMaterialValue = materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString();
  const totalProductionToday = cuttingRecords.filter(r => r.date === new Date().toLocaleDateString('en-CA')).reduce((sum, item) => sum + item.total, 0);

  if (loading) {
    return <div className="loading-placeholder">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-grid">
      <StatCard title="Active Employees" value={employees.filter(e => e.Status === 'Active').length} icon={Users} color="blue" />
      <StatCard title="Raw Material Value" value={`৳${totalMaterialValue}`} icon={Package} color="green" />
      <StatCard title="Production Today (pcs)" value={totalProductionToday} icon={Factory} color="yellow" />
      <StatCard title="Total Shipments" value={shipments.length} icon={Truck} color="purple" />
    </div>
  );
};

export default Dashboard;
