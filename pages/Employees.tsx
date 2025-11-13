import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/mockApi';
import { Employee, Settings } from '../types';
import Card from '../components/Card';
import { Users, PlusCircle, Pencil, Trash2 } from 'lucide-react';

const emptyEmployee: Omit<Employee, 'ID'> = {
  Name: '',
  Designation: '',
  Department: '',
  DOJ: new Date().toISOString().split('T')[0],
  Type: 'Production',
  Status: 'Active',
  Salary: 0,
};

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | Omit<Employee, 'ID'>>(emptyEmployee);
  const [error, setError] = useState('');

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [empData, settingsData] = await Promise.all([
        api.getEmployees(),
        api.getSettings(),
      ]);
      setEmployees(empData);
      setSettings(settingsData);
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError('Failed to load employee data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingEmployee(prev => ({ ...prev, [name]: name === 'Salary' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.saveEmployee(editingEmployee);
      setShowForm(false);
      setEditingEmployee(emptyEmployee);
      fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee.');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.deleteEmployee(employeeId);
        fetchAllData();
      } catch (err: any) {
        setError(err.message || 'Failed to delete employee.');
      }
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setEditingEmployee(emptyEmployee);
    setError('');
  };

  return (
    <div className="page-container">
      <Card
        title="Employee Management"
        titleIcon={Users}
        headerContent={
          <button onClick={toggleForm} className="button button-primary">
            <PlusCircle size={18} />
            <span>{showForm ? 'Cancel' : 'Add Employee'}</span>
          </button>
        }
      >
        {showForm && (
          <div className="form-container">
            <h3 className="form-title">
              {'ID' in editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <form onSubmit={handleSubmit} className="form-grid">
              {error && <p className="form-error form-group-full">{error}</p>}
              <div className="form-group">
                <label>Full Name</label>
                <input name="Name" value={editingEmployee.Name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <select name="Designation" value={editingEmployee.Designation} onChange={handleInputChange} required>
                  <option value="">Select...</option>
                  {settings?.designations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="Department" value={editingEmployee.Department} onChange={handleInputChange} required>
                   <option value="">Select...</option>
                  {settings?.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Employee Type</label>
                <select name="Type" value={editingEmployee.Type} onChange={handleInputChange} required>
                  {settings?.empTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
               <div className="form-group">
                <label>Status</label>
                <select name="Status" value={editingEmployee.Status} onChange={handleInputChange} required>
                  {settings?.empStatus.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date of Joining</label>
                <input name="DOJ" value={editingEmployee.DOJ} onChange={handleInputChange} type="date" required />
              </div>
              <div className="form-group">
                <label>Salary</label>
                <input name="Salary" value={editingEmployee.Salary} onChange={handleInputChange} type="number" step="100" required />
              </div>
               <div className="form-group form-group-full">
                <button type="submit" className="button button-success">Save Employee</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-placeholder">Loading employees...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.ID}>
                    <td>{employee.ID}</td>
                    <td>{employee.Name}</td>
                    <td>{employee.Designation}</td>
                    <td>{employee.Department}</td>
                    <td>
                      <span className={`status-badge ${
                        employee.Status === 'Active' ? 'status-active' : 'status-inactive'
                      }`}>
                        {employee.Status}
                      </span>
                    </td>
                    <td>৳{employee.Salary.toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button action-button-edit" onClick={() => handleEdit(employee)}>
                          <Pencil />
                        </button>
                        <button className="action-button action-button-delete" onClick={() => handleDelete(employee.ID)}>
                           <Trash2 />
                        </button>
                      </div>
                    </td>
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

export default Employees;