
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
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Shipments</h1>
            <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                <PlusCircle size={18} /> {showForm ? 'Cancel' : 'New Shipment'}
            </button>
        </div>
        
        {showForm && (
            <Card title="New Shipment">
                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="orderNumber" value={newShipment.orderNumber} onChange={handleInputChange} placeholder="Order Number" className="p-2 border rounded" required />
                        <input name="customer" value={newShipment.customer} onChange={handleInputChange} placeholder="Customer Name" className="p-2 border rounded" required />
                        <select name="itemName" value={newShipment.itemName} onChange={handleInputChange} required className="p-2 border rounded">
                            <option value="">Select Item</option>
                            {stockItems.map(item => <option key={item.id} value={item.itemName}>{item.itemName} (Stock: {item.quantity})</option>)}
                        </select>
                         <div>
                            <input name="quantity" value={newShipment.quantity} onChange={handleInputChange} type="number" placeholder="Quantity" className="p-2 border rounded w-full" required max={selectedStockItem?.quantity}/>
                            {selectedStockItem && newShipment.quantity > selectedStockItem.quantity && <p className="text-red-500 text-xs mt-1">Exceeds available stock!</p>}
                        </div>
                        <input name="value" value={newShipment.value} onChange={handleInputChange} type="number" step="0.01" placeholder="Total Value" className="p-2 border rounded" required />
                        <input name="destination" value={newShipment.destination} onChange={handleInputChange} placeholder="Destination" className="p-2 border rounded" />
                        <input name="shipmentDate" value={newShipment.shipmentDate} onChange={handleInputChange} type="date" className="p-2 border rounded" />
                        <select name="status" value={newShipment.status} onChange={handleInputChange} className="p-2 border rounded">
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                    <button type="submit" className="p-2 bg-green-600 text-white rounded hover:bg-green-700">Save Shipment</button>
                </form>
            </Card>
        )}

        <Card title="Shipment Records" titleIcon={Truck}>
        {loading ? (
            <div className="text-center p-4">Loading shipments...</div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((s) => (
                    <tr key={s.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.itemName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">৳{s.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.shipmentDate}</td>
                    <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.status === 'Delivered' ? 'bg-green-100 text-green-800' : s.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{s.status}</span></td>
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
