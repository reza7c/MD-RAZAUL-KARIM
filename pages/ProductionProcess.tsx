import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/Card';
import { api } from '../services/mockApi';
import { Employee, RawMaterial, Settings, CuttingRecord, SewingRecord, FinishingRecord, ProductionSizeQuantities } from '../types';

type ProcessType = 'cutting' | 'sewing' | 'finishing';

const StatusBadge: React.FC<{ status: 'Completed' | 'Pending' }> = ({ status }) => (
    <span className={`status-badge ${
        status === 'Completed' ? 'status-active' : 'status-pending'
    }`}>
        {status}
    </span>
);

const ProductionProcess: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ProcessType>('cutting');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    
    const [cuttingRecords, setCuttingRecords] = useState<CuttingRecord[]>([]);
    const [sewingRecords, setSewingRecords] = useState<SewingRecord[]>([]);
    const [finishingRecords, setFinishingRecords] = useState<FinishingRecord[]>([]);

    const [availableCutStock, setAvailableCutStock] = useState<{ styleName: string; quantity: number }[]>([]);
    const [availableSewStock, setAvailableSewStock] = useState<{ styleName: string; quantity: number }[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        styleName: '',
        employeeId: '',
        materialUsedId: '',
        fabricUsed: 0,
        sizes: { s: 0, m: 0, l: 0, xl: 0, xxl: 0 },
        quantity: 0, // for finishing
        rate: 1.5
    });

    const totalSizeQuantity = useMemo(() => Object.values(formData.sizes).reduce((sum: number, qty: number) => sum + qty, 0), [formData.sizes]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [emps, sets, mats, cuts, sews, fins, cutStock, sewStock] = await Promise.all([
                api.getEmployees(),
                api.getSettings(),
                api.getRawMaterials(),
                api.getCuttingRecords(),
                api.getSewingRecords(),
                api.getFinishingRecords(),
                api.getAvailableCuttingStock(),
                api.getAvailableSewingStock(),
            ]);
            setEmployees(emps);
            setSettings(sets);
            setRawMaterials(mats);
            setCuttingRecords(cuts);
            setSewingRecords(sews);
            setFinishingRecords(fins);
            setAvailableCutStock(cutStock);
            setAvailableSewStock(sewStock);
        } catch (err) {
            setError('Failed to load production data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const resetForm = () => {
        setFormData({
            styleName: '', employeeId: '', materialUsedId: '', fabricUsed: 0, 
            sizes: { s: 0, m: 0, l: 0, xl: 0, xxl: 0 }, quantity: 0, rate: 1.5
        });
        setError('');
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, sizes: { ...prev.sizes, [name]: parseInt(value) || 0 }}));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ['fabricUsed', 'quantity', 'rate'];
        setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const employee = employees.find(emp => emp.ID === formData.employeeId);
        if (!employee) { setError("Employee not found"); return; }
        
        try {
            if (activeTab === 'cutting') {
                const material = rawMaterials.find(m => m.id === formData.materialUsedId);
                if (!material) { setError("Material not found"); return; }
                await api.saveCuttingProcess({
                    styleName: formData.styleName, employeeId: formData.employeeId, employeeName: employee.Name,
                    materialUsedId: formData.materialUsedId, materialUsedName: material.name,
                    fabricUsed: formData.fabricUsed, unit: material.unit, ...formData.sizes, total: totalSizeQuantity,
                    rate: formData.rate, date: new Date().toLocaleDateString('en-CA'), status: 'Completed'
                });
            } else if (activeTab === 'sewing') {
                await api.saveSewingProcess({
                    styleName: formData.styleName, employeeId: formData.employeeId, employeeName: employee.Name,
                    ...formData.sizes, total: totalSizeQuantity, rate: formData.rate,
                    date: new Date().toLocaleDateString('en-CA'), status: 'Completed'
                });
            } else if (activeTab === 'finishing') {
                 await api.saveFinishingProcess({
                    styleName: formData.styleName, employeeId: formData.employeeId, employeeName: employee.Name,
                    quantity: formData.quantity, rate: formData.rate,
                    date: new Date().toLocaleDateString('en-CA'), status: 'Completed'
                });
            }
            resetForm();
            fetchData(); // Refresh all data
        } catch (err: any) {
            setError(err.message || "An error occurred");
        }
    };
    
    const renderForm = () => {
        const activeEmployees = employees.filter(e => e.Status === 'Active');
        const selectedMaterial = rawMaterials.find(m => m.id === formData.materialUsedId);
        const selectedCutStock = availableCutStock.find(s => s.styleName === formData.styleName);
        const selectedSewStock = availableSewStock.find(s => s.styleName === formData.styleName);
        
        return (
            <Card title={`New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Record`}>
                <form onSubmit={handleSubmit} className="form-grid">
                    {error && <p className="form-error form-group-full">{error}</p>}
                    
                    <div className="form-group">
                        <label>Style Name</label>
                        <select name="styleName" value={formData.styleName} onChange={handleInputChange} required>
                            <option value="">Select Style</option>
                            {activeTab === 'cutting' && settings?.styleNames.map(s => <option key={s} value={s}>{s}</option>)}
                            {activeTab === 'sewing' && availableCutStock.map(s => <option key={s.styleName} value={s.styleName}>{s.styleName} (Cut: {s.quantity})</option>)}
                            {activeTab === 'finishing' && availableSewStock.map(s => <option key={s.styleName} value={s.styleName}>{s.styleName} (Sewn: {s.quantity})</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Employee</label>
                        <select name="employeeId" value={formData.employeeId} onChange={handleInputChange} required>
                            <option value="">Select Employee</option>
                            {activeEmployees.map(e => <option key={e.ID} value={e.ID}>{e.Name}</option>)}
                        </select>
                    </div>

                    {activeTab === 'cutting' && (
                        <>
                            <div className="form-group">
                                <label>Material Used</label>
                                <select name="materialUsedId" value={formData.materialUsedId} onChange={handleInputChange} required>
                                    <option value="">Select Material</option>
                                    {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity} {m.unit})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fabric Used ({selectedMaterial?.unit})</label>
                                <input name="fabricUsed" value={formData.fabricUsed} onChange={handleInputChange} type="number" required max={selectedMaterial?.quantity} />
                                {selectedMaterial && formData.fabricUsed > selectedMaterial.quantity && <p className="form-validation-error">Exceeds stock!</p>}
                            </div>
                        </>
                    )}
                    {activeTab !== 'finishing' ? (
                        <div className="form-group form-group-full">
                            <label>Size Quantities (Total: {totalSizeQuantity})</label>
                            {selectedCutStock && totalSizeQuantity > selectedCutStock.quantity && <p className="form-validation-error">Total quantity exceeds available cut stock ({selectedCutStock.quantity})!</p>}
                            <div className="size-inputs-grid">
                                {Object.keys(formData.sizes).map(size => (
                                    <input key={size} name={size} value={formData.sizes[size as keyof ProductionSizeQuantities]} onChange={handleSizeChange} type="number" placeholder={size.toUpperCase()} />
                                ))}
                            </div>
                        </div>
                    ) : (
                         <div className="form-group">
                            <label>Quantity</label>
                            <input name="quantity" value={formData.quantity} onChange={handleInputChange} type="number" required max={selectedSewStock?.quantity} />
                             {selectedSewStock && formData.quantity > selectedSewStock.quantity && <p className="form-validation-error">Exceeds sewn stock ({selectedSewStock.quantity})!</p>}
                        </div>
                    )}
                    <div className="form-group">
                        <label>Rate</label>
                        <input name="rate" value={formData.rate} onChange={handleInputChange} type="number" step="0.01" required />
                    </div>
                     <div className="form-group form-group-full">
                        <button type="submit" className="button button-primary">Add Record</button>
                    </div>
                </form>
            </Card>
        );
    };

    const renderTable = () => {
        let records: any[] = [];
        let headers: string[] = [];
        let tableBody: React.ReactNode = null;
    
        if (activeTab === 'cutting') {
            records = cuttingRecords;
            headers = ['ID', 'Style', 'Employee', 'Material', 'Fabric Used', 'Total', 'Rate', 'Amount', 'Date', 'Status'];
            tableBody = records.map((r: CuttingRecord) => (
                <tr key={r.id}>
                    <td>{r.id}</td><td>{r.styleName}</td><td>{r.employeeName}</td>
                    <td>{r.materialUsedName}</td><td>{r.fabricUsed} {r.unit}</td>
                    <td className="font-semibold">{r.total}</td><td>৳{r.rate.toFixed(2)}</td>
                    <td>৳{r.amount.toFixed(2)}</td><td>{r.date}</td>
                    <td><StatusBadge status={r.status} /></td>
                </tr>
            ));
        } else if (activeTab === 'sewing') {
            records = sewingRecords;
            headers = ['ID', 'Style', 'Employee', 'Total', 'Rate', 'Amount', 'Date', 'Status'];
            tableBody = records.map((r: SewingRecord) => (
                <tr key={r.id}>
                    <td>{r.id}</td><td>{r.styleName}</td><td>{r.employeeName}</td>
                    <td className="font-semibold">{r.total}</td><td>৳{r.rate.toFixed(2)}</td>
                    <td>৳{r.amount.toFixed(2)}</td><td>{r.date}</td>
                    <td><StatusBadge status={r.status} /></td>
                </tr>
            ));
        } else if (activeTab === 'finishing') {
            records = finishingRecords;
            headers = ['ID', 'Style', 'Employee', 'Quantity', 'Rate', 'Amount', 'Date', 'Status'];
            tableBody = records.map((r: FinishingRecord) => (
                <tr key={r.id}>
                   <td>{r.id}</td><td>{r.styleName}</td><td>{r.employeeName}</td>
                   <td className="font-semibold">{r.quantity}</td><td>৳{r.rate.toFixed(2)}</td>
                   <td>৳{r.totalAmount.toFixed(2)}</td><td>{r.date}</td>
                   <td><StatusBadge status={r.status} /></td>
                </tr>
            ));
        }
    
        if (records.length === 0) {
            tableBody = (
                <tr>
                    <td colSpan={headers.length} className="text-center p-4">
                        No records found.
                    </td>
                </tr>
            );
        }
    
        return (
            <Card title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Records`}>
                <div className="table-container">
                <table className="data-table">
                    <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>{tableBody}</tbody>
                </table>
                </div>
            </Card>
        );
    };

    if (loading) return <div className="loading-placeholder">Loading...</div>;

    return (
        <div className="page-container">
            <div className="tabs-container">
                <nav className="tabs-nav">
                    {(['cutting', 'sewing', 'finishing'] as ProcessType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); resetForm(); }}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {renderForm()}
            {renderTable()}
        </div>
    );
};

export default ProductionProcess;
