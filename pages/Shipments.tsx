import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/mockApi';
import { Shipment, StockItem } from '../types';
import Card from '../components/Card';
import { Truck, PlusCircle } from 'lucide-react';

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newShipment, setNewShipment] = useState<Omit<Shipment, 'id'>>({
      orderNumber: '', customer: '', itemName: '', quantity: 0, value: 0, 
      shipmentDate: new Date().toLocaleDateString('en-CA'), status: 'Pending', destination: ''
  });
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [shipmentData, stockData] = await Promise.all([
          api.getShipments(),
          api.getStockItems(),
      ]);
      setShipments(shipmentData);
      setStockItems(stockData.filter(item => item.category === 'Finished Goods' && item.quantity > 0));
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Failed to load shipment data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewShipment(prev => ({ ...prev, [name]: name === 'quantity' || name === 'value' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      try {
          await api.saveShipment(newShipment);
          setShowForm(false);
          setNewShipment({
              orderNumber: '', customer: '', itemName: '', quantity: 0, value: 0, 
              shipmentDate: new Date().toLocaleDateString('en-CA'), status: 'Pending', destination: ''
          });
          fetchData();
      } catch (err: any) {
          console.error("Failed to save shipment", err);
          setError(err.message || 'Failed to save shipment.');
      }
  };

  const selectedStockItem = stockItems.find(item => item.itemName === newShipment.itemName);

  return (
    <div className="page-container">
      <Card
        title="Shipment Records"
        titleIcon={Truck}
        headerContent={
            <button
                onClick={() => setShowForm(!showForm)}
                className="button button-primary"
            >
                <PlusCircle size={18} />
                <span>{showForm ? 'Cancel' : 'New Shipment'}</span>
            </button>
        }
      >
        {showForm && (
            <div className="form-container">
                <h3 className="form-title">New Shipment</h3>
                <form onSubmit={handleSubmit} className="form-grid">
                     {error && <p className="form-error form-group-full">{error}</p>}
                    <div className="form-group">
                        <label>Order Number</label>
                        <input name="orderNumber" value={newShipment.orderNumber} onChange={handleInputChange} placeholder="e.g., ORD-001" required />
                    </div>
                    <div className="form-group">
                        <label>Customer</label>
                        <input name="customer" value={newShipment.customer} onChange={handleInputChange} placeholder="Customer Name" required />
                    </div>
                     <div className="form-group">
                        <label>Item</label>
                        <select name="itemName" value={newShipment.itemName} onChange={handleInputChange} required>
                            <option value="">Select Item</option>
                            {stockItems.map(item => <option key={item.id} value={item.itemName}>{item.itemName} (Stock: {item.quantity})</option>)}
                        </select>
                    </div>
                     <div className="form-group">
                        <label>Quantity</label>
                        <input name="quantity" value={newShipment.quantity} onChange={handleInputChange} type="number" placeholder="0" required max={selectedStockItem?.quantity}/>
                        {selectedStockItem && newShipment.quantity > selectedStockItem.quantity && <p className="form-validation-error">Exceeds available stock!</p>}
                    </div>
                    <div className="form-group">
                        <label>Total Value</label>
                        <input name="value" value={newShipment.value} onChange={handleInputChange} type="number" step="0.01" placeholder="0.00" required />
                    </div>
                    <div className="form-group">
                        <label>Destination</label>
                        <input name="destination" value={newShipment.destination} onChange={handleInputChange} placeholder="e.g., Chittagong" />
                    </div>
                    <div className="form-group">
                        <label>Shipment Date</label>
                        <input name="shipmentDate" value={newShipment.shipmentDate} onChange={handleInputChange} type="date" />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={newShipment.status} onChange={handleInputChange}>
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                    <div className="form-group form-group-full">
                        <button type="submit" className="button button-success">Save Shipment</button>
                    </div>
                </form>
            </div>
        )}

        {loading ? (
            <div className="loading-placeholder">Loading shipments...</div>
        ) : (
            <div className="table-container">
            <table className="data-table">
                <thead>
                <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Value</th>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {shipments.map((s) => (
                    <tr key={s.id}>
                    <td>{s.orderNumber}</td>
                    <td>{s.customer}</td>
                    <td>{s.itemName}</td>
                    <td>{s.quantity}</td>
                    <td>৳{s.value.toLocaleString()}</td>
                    <td>{s.shipmentDate}</td>
                    <td><span className={`status-badge ${s.status === 'Delivered' ? 'status-active' : s.status === 'Shipped' ? 'status-shipped' : 'status-pending'}`}>{s.status}</span></td>
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

export default Shipments;
