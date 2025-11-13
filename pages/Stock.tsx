import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { StockItem } from '../types';
import Card from '../components/Card';
import { Warehouse } from 'lucide-react';

const Stock: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const data = await api.getStockItems();
        setStockItems(data);
      } catch (error) {
        console.error("Failed to fetch stock items", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  return (
    <Card title="Stock Management" titleIcon={Warehouse}>
      {loading ? (
        <div className="loading-placeholder">Loading stock...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.itemName}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>৳{item.unitPrice.toLocaleString()}</td>
                  <td>৳{item.totalValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default Stock;
