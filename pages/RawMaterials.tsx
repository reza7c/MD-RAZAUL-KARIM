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
    <div className="page-container">
      <Card
        title="Material Stock"
        titleIcon={Package}
        headerContent={
          <button
            onClick={() => setShowForm(!showForm)}
            className="button button-primary"
          >
            <PlusCircle size={18} />
            <span>{showForm ? 'Cancel' : 'Add Material'}</span>
          </button>
        }
      >
        {showForm && (
          <div className="form-container">
            <h3 className="form-title">Add New Raw Material</h3>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                  <label htmlFor="name">Material Name</label>
                  <input id="name" name="name" value={newMaterial.name} onChange={handleInputChange} placeholder="e.g., Cotton Fabric" required />
              </div>
              <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <input id="type" name="type" value={newMaterial.type} onChange={handleInputChange} placeholder="e.g., Fabrics" />
              </div>
               <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input id="quantity" name="quantity" value={newMaterial.quantity} onChange={handleInputChange} type="number" placeholder="0" required />
              </div>
               <div className="form-group">
                  <label htmlFor="unit">Unit</label>
                  <input id="unit" name="unit" value={newMaterial.unit} onChange={handleInputChange} placeholder="e.g., KG, pcs" />
              </div>
              <div className="form-group">
                  <label htmlFor="unitPrice">Unit Price</label>
                  <input id="unitPrice" name="unitPrice" value={newMaterial.unitPrice} onChange={handleInputChange} type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div className="form-group">
                  <label htmlFor="supplier">Supplier</label>
                  <input id="supplier" name="supplier" value={newMaterial.supplier} onChange={handleInputChange} placeholder="e.g., Sumaya Traders" />
              </div>
              <div className="form-group form-group-full">
                <button type="submit" className="button button-success">Save Material</button>
              </div>
            </form>
          </div>
        )}
        
        {loading ? (
          <div className="loading-placeholder">Loading materials...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id}>
                    <td>{mat.id}</td>
                    <td>{mat.name}</td>
                    <td>{mat.quantity} {mat.unit}</td>
                    <td>৳{mat.unitPrice.toLocaleString()}</td>
                    <td>৳{(mat.quantity * mat.unitPrice).toLocaleString()}</td>
                    <td>{mat.supplier}</td>
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
