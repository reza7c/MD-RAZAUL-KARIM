
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { RawMaterial } from '../types';
import Card from '../components/Card';
import { Package, PlusCircle } from 'lucide-react';

const RawMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Omit<RawMaterial, 'id'>>({
      name: '', type: 'Fabrics', quantity: 0, unit: 'KG', unitPrice: 0, supplier: ''
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await api.getRawMaterials();
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch raw materials", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setNewMaterial(prev => ({ ...prev, [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.saveRawMaterial(newMaterial);
          setShowForm(false);
          setNewMaterial({ name: '', type: 'Fabrics', quantity: 0, unit: 'KG', unitPrice: 0, supplier: '' });
          fetchMaterials();
      } catch (error) {
          console.error("Failed to save material", error);
      }
  };


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Raw Materials</h1>
            <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                <PlusCircle size={18} /> {showForm ? 'Cancel' : 'Add Material'}
            </button>
        </div>
        
        {showForm && (
            <Card title="Add New Raw Material">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input name="name" value={newMaterial.name} onChange={handleInputChange} placeholder="Material Name" className="p-2 border rounded" required />
                    <input name="type" value={newMaterial.type} onChange={handleInputChange} placeholder="Type (e.g., Fabrics)" className="p-2 border rounded" />
                    <input name="quantity" value={newMaterial.quantity} onChange={handleInputChange} type="number" placeholder="Quantity" className="p-2 border rounded" required />
                    <input name="unit" value={newMaterial.unit} onChange={handleInputChange} placeholder="Unit (e.g., KG, pcs)" className="p-2 border rounded" />
                    <input name="unitPrice" value={newMaterial.unitPrice} onChange={handleInputChange} type="number" step="0.01" placeholder="Unit Price" className="p-2 border rounded" required />
                    <input name="supplier" value={newMaterial.supplier} onChange={handleInputChange} placeholder="Supplier" className="p-2 border rounded" />
                    <button type="submit" className="col-span-full md:col-span-1 lg:col-span-1 p-2 bg-green-600 text-white rounded hover:bg-green-700">Save Material</button>
                </form>
            </Card>
        )}

        <Card title="Material Stock" titleIcon={Package}>
        {loading ? (
            <div className="text-center p-4">Loading materials...</div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((mat) => (
                    <tr key={mat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mat.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mat.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mat.quantity} {mat.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">৳{mat.unitPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">৳{(mat.quantity * mat.unitPrice).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mat.supplier}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </Card>
    </div>
  );
};

export default RawMaterials;
