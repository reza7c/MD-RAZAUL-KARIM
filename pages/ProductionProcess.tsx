import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/Card';
import { api } from '../services/mockApi';
import { Employee, RawMaterial, Settings, CuttingRecord, SewingRecord, FinishingRecord, ProductionSizeQuantities } from '../types';

type ProcessType = 'cutting' | 'sewing' | 'finishing';

const StatusBadge: React.FC<{ status: 'Completed' | 'Pending' }> = ({ status }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm font-medium">Style Name</label>
                            <select name="styleName" value={formData.styleName} onChange={handleInputChange} required className="p-2 border rounded">
                                <option value="">Select Style</option>
                                {activeTab === 'cutting' && settings?.styleNames.map(s => <option key={s} value={s}>{s}</option>)}
                                {activeTab === 'sewing' && availableCutStock.map(s => <option key={s.styleName} value={s.styleName}>{s.styleName} (Cut: {s.quantity})</option>)}
                                {activeTab === 'finishing' && availableSewStock.map(s => <option key={s.styleName} value={s.styleName}>{s.styleName} (Sewn: {s.quantity})</option>)}
                            </select>
                        </div>
                         <div className="flex flex-col">
                            <label className="mb-1 text-sm font-medium">Employee</label>
                            <select name="employeeId" value={formData.employeeId} onChange={handleInputChange} required className="p-2 border rounded">
                                <option value="">Select Employee</option>
                                {activeEmployees.map(e => <option key={e.ID} value={e.ID}>{e.Name}</option>)}
                            </select>
                        </div>
                    </div>
                    {activeTab === 'cutting' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium">Material Used</label>
                                <select name="materialUsedId" value={formData.materialUsedId} onChange={handleInputChange} required className="p-2 border rounded">
                                    <option value="">Select Material</option>
                                    {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity} {m.unit})</option>)}
                                </select>
                            </div>
                             <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium">Fabric Used ({selectedMaterial?.unit})</label>
                                <input name="fabricUsed" value={formData.fabricUsed} onChange={handleInputChange} type="number" required className="p-2 border rounded" max={selectedMaterial?.quantity} />
                                {selectedMaterial && formData.fabricUsed > selectedMaterial.quantity && <p className="text-red-500 text-xs mt-1">Exceeds stock!</p>}
                            </div>
                        </div>
                    )}
                    {activeTab !== 'finishing' ? (
                        <div>
                            <label className="block mb-1 text-sm font-medium">Size Quantities (Total: {totalSizeQuantity})</label>
                            {selectedCutStock && totalSizeQuantity > selectedCutStock.quantity && <p className="text-red-500 text-xs mb-1">Total quantity exceeds available cut stock ({selectedCutStock.quantity})!</p>}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {Object.keys(formData.sizes).map(size => (
                                    <input key={size} name={size} value={formData.sizes[size as keyof ProductionSizeQuantities]} onChange={handleSizeChange} type="number" placeholder={size.toUpperCase()} className="p-2 border rounded text-center"/>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <div className="flex flex-col">
                            <label className="mb-1 text-sm font-medium">Quantity</label>
                            <input name="quantity" value={formData.quantity} onChange={handleInputChange} type="number" required className="p-2 border rounded" max={selectedSewStock?.quantity} />
                             {selectedSewStock && formData.quantity > selectedSewStock.quantity && <p className="text-red-500 text-xs mt-1">Exceeds sewn stock ({selectedSewStock.quantity})!</p>}
                        </div>
                    )}
                    <div className="flex flex-col w-full md:w-1/3">
                        <label className="mb-1 text-sm font-medium">Rate</label>
                        <input name="rate" value={formData.rate} onChange={handleInputChange} type="number" step="0.01" required className="p-2 border rounded" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Record</button>
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
            headers = ['ID', 'Style', 'Employee', 'Material', 'Material ID', 'Fabric Used', 'S', 'M', 'L', 'XL', 'XXL', 'Total', 'Rate', 'Amount', 'Date', 'Status'];
            tableBody = records.map((r: CuttingRecord) => (
                <tr key={r.id} className="border-b">
                    <td className="p-2">{r.id}</td>
                    <td className="p-2">{r.styleName}</td>
                    <td className="p-2">{r.employeeName}</td>
                    <td className="p-2">{r.materialUsedName}</td>
                    <td className="p-2">{r.materialUsedId}</td>
                    <td className="p-2">{r.fabricUsed} {r.unit}</td>
                    <td className="p-2">{r.s}</td>
                    <td className="p-2">{r.m}</td>
                    <td className="p-2">{r.l}</td>
                    <td className="p-2">{r.xl}</td>
                    <td className="p-2">{r.xxl}</td>
                    <td className="p-2 font-bold">{r.total}</td>
                    <td className="p-2">৳{r.rate.toFixed(2)}</td>
                    <td className="p-2">৳{r.amount.toFixed(2)}</td>
                    <td className="p-2">{r.date}</td>
                    <td className="p-2"><StatusBadge status={r.status} /></td>
                </tr>
            ));
        } else if (activeTab === 'sewing') {
            records = sewingRecords;
            headers = ['ID', 'Style', 'Employee', 'S', 'M', 'L', 'XL', 'XXL', 'Total', 'Rate', 'Amount', 'Date', 'Status'];
            tableBody = records.map((r: SewingRecord) => (
                <tr key={r.id} className="border-b">
                    <td className="p-2">{r.id}</td>
                    <td className="p-2">{r.styleName}</td>
                    <td className="p-2">{r.employeeName}</td>
                    <td className="p-2">{r.s}</td>
                    <td className="p-2">{r.m}</td>
                    <td className="p-2">{r.l}</td>
                    <td className="p-2">{r.xl}</td>
                    <td className="p-2">{r.xxl}</td>
                    <td className="p-2 font-bold">{r.total}</td>
                    <td className="p-2">৳{r.rate.toFixed(2)}</td>
                    <td className="p-2">৳{r.amount.toFixed(2)}</td>
                    <td className="p-2">{r.date}</td>
                    <td className="p-2"><StatusBadge status={r.status} /></td>
                </tr>
            ));
        } else if (activeTab === 'finishing') {
            records = finishingRecords;
            headers = ['ID', 'Style', 'Employee', 'Quantity', 'Rate', 'Amount', 'Date', 'Status'];
            tableBody = records.map((r: FinishingRecord) => (
                <tr key={r.id} className="border-b">
                    <td className="p-2">{r.id}</td>
                    <td className="p-2">{r.styleName}</td>
                    <td className="p-2">{r.employeeName}</td>
                    <td className="p-2 font-bold">{r.quantity}</td>
                    <td className="p-2">৳{r.rate.toFixed(2)}</td>
                    <td className="p-2">৳{r.totalAmount.toFixed(2)}</td>
                    <td className="p-2">{r.date}</td>
                    <td className="p-2"><StatusBadge status={r.status} /></td>
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
                <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100">{headers.map(h => <th key={h} className="p-2 text-left font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {tableBody}
                    </tbody>
                </table>
                </div>
            </Card>
        );
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['cutting', 'sewing', 'finishing'] as ProcessType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); resetForm(); }}
                            className={`${
                                activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
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
