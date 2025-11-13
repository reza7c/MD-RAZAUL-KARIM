import { Employee, RawMaterial, CuttingRecord, SewingRecord, FinishingRecord, StockItem, Shipment, Settings } from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock Database
let employees: Employee[] = [
  { ID: 'AMS-0001', Name: 'John Doe', Designation: 'Operator', Department: 'Sewing', DOJ: '2023-01-01', Type: 'Production', Status: 'Active', Salary: 15000 },
  { ID: 'AMS-0002', Name: 'Jane Smith', Designation: 'Supervisor', Department: 'Cutting', DOJ: '2022-02-15', Type: 'Monthly', Status: 'Active', Salary: 25000 },
  { ID: 'AMS-0003', Name: 'Mike Johnson', Designation: 'Manager', Department: 'Finishing', DOJ: '2021-03-10', Type: 'Monthly', Status: 'Active', Salary: 45000 },
];

let rawMaterials: RawMaterial[] = [
  { id: 'MAT-001', name: 'Chelly Patta', type: 'Fabrics', quantity: 500, unit: 'KG', unitPrice: 190, supplier: 'Sumaya Traders' },
  { id: 'MAT-002', name: 'Patta', type: 'Fabrics', quantity: 300, unit: 'KG', unitPrice: 190, supplier: 'Noor Traders' },
  { id: 'MAT-003', name: 'Cotton Fabric', type: 'Fabrics', quantity: 1000, unit: 'KG', unitPrice: 250, supplier: 'Sumaya Traders' },
];

let cuttingRecords: CuttingRecord[] = [];
let sewingRecords: SewingRecord[] = [];
let finishingRecords: FinishingRecord[] = [];
let stockItems: StockItem[] = [];
let shipments: Shipment[] = [];

const settings: Settings = {
    departments: ['BOD', 'HR', 'Production', 'Admin', 'Cutting', 'Sewing', 'Finishing'],
    designations: ['MD', 'Manager', 'Supervisor', 'Operator', 'Assistant', 'Management Trainee'],
    empTypes: ['Monthly', 'Production', 'Contract', 'Permanent'],
    empStatus: ['Active', 'Inactive'],
    styleNames: ['Polo Shirt', 'Mens T-Shirt', 'Magi T Shirt', 'Ladies Top', 'Kids Wear']
};

// API Functions
export const api = {
  getSettings: async (): Promise<Settings> => {
    await delay(200);
    return JSON.parse(JSON.stringify(settings));
  },
  getEmployees: async (): Promise<Employee[]> => {
    await delay(500);
    return JSON.parse(JSON.stringify(employees));
  },
  saveEmployee: async (employeeData: Omit<Employee, 'ID'> & { ID?: string }): Promise<Employee> => {
    await delay(600);
    if (employeeData.ID && employeeData.ID !== 'AMS-0000') {
      // Update
      const index = employees.findIndex(e => e.ID === employeeData.ID);
      if (index !== -1) {
        employees[index] = { ...employees[index], ...employeeData } as Employee;
        return employees[index];
      } else {
        throw new Error("Employee not found for update");
      }
    } else {
      // Create new
      const lastIdNum = employees.reduce((max, e) => {
        const num = parseInt(e.ID.split('-')[1]);
        return num > max ? num : max;
      }, 0);
      const newId = `AMS-${(lastIdNum + 1).toString().padStart(4, '0')}`;
      const newEmployee: Employee = {
        ...employeeData,
        ID: newId,
      };
      employees.push(newEmployee);
      return newEmployee;
    }
  },

  deleteEmployee: async (employeeId: string): Promise<{ success: boolean }> => {
    await delay(400);
    const initialLength = employees.length;
    employees = employees.filter(e => e.ID !== employeeId);
    if (employees.length === initialLength) {
      throw new Error("Employee not found for deletion");
    }
    return { success: true };
  },
  getRawMaterials: async (): Promise<RawMaterial[]> => {
    await delay(400);
    return JSON.parse(JSON.stringify(rawMaterials));
  },
  getCuttingRecords: async (): Promise<CuttingRecord[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(cuttingRecords));
  },
  getSewingRecords: async (): Promise<SewingRecord[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(sewingRecords));
  },
  getFinishingRecords: async (): Promise<FinishingRecord[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(finishingRecords));
  },
  getStockItems: async (): Promise<StockItem[]> => {
    await delay(400);
    return JSON.parse(JSON.stringify(stockItems));
  },
  getShipments: async (): Promise<Shipment[]> => {
    await delay(400);
    return JSON.parse(JSON.stringify(shipments));
  },

  saveCuttingProcess: async (record: Omit<CuttingRecord, 'id' | 'amount'>): Promise<CuttingRecord> => {
    await delay(700);
    const material = rawMaterials.find(m => m.id === record.materialUsedId);
    if (!material) throw new Error("Material not found");
    if (material.quantity < record.fabricUsed) throw new Error("Insufficient fabric stock");

    material.quantity -= record.fabricUsed;

    const newRecord: CuttingRecord = {
      ...record,
      id: `CUT-${(cuttingRecords.length + 1).toString().padStart(3, '0')}`,
      amount: record.total * record.rate,
    };
    cuttingRecords.push(newRecord);
    return newRecord;
  },

  getAvailableCuttingStock: async (): Promise<{ styleName: string; quantity: number }[]> => {
    await delay(200);
    const cutStock: { [key: string]: number } = {};
    cuttingRecords.forEach(r => {
      cutStock[r.styleName] = (cutStock[r.styleName] || 0) + r.total;
    });
    sewingRecords.forEach(r => {
      cutStock[r.styleName] = (cutStock[r.styleName] || 0) - r.total;
    });
    return Object.entries(cutStock)
      .filter(([, quantity]) => quantity > 0)
      .map(([styleName, quantity]) => ({ styleName, quantity }));
  },

  saveSewingProcess: async (record: Omit<SewingRecord, 'id' | 'amount'>): Promise<SewingRecord> => {
    await delay(700);
    const availableStock = await api.getAvailableCuttingStock();
    const styleStock = availableStock.find(s => s.styleName === record.styleName);
    if (!styleStock || styleStock.quantity < record.total) {
      throw new Error("Insufficient cutting stock to issue for sewing.");
    }
    const newRecord: SewingRecord = {
      ...record,
      id: `SEW-${(sewingRecords.length + 1).toString().padStart(3, '0')}`,
      amount: record.total * record.rate,
    };
    sewingRecords.push(newRecord);
    return newRecord;
  },
  
  getAvailableSewingStock: async (): Promise<{ styleName: string; quantity: number }[]> => {
    await delay(200);
    const sewnStock: { [key: string]: number } = {};
    sewingRecords.forEach(r => {
        sewnStock[r.styleName] = (sewnStock[r.styleName] || 0) + r.total;
    });
    finishingRecords.forEach(r => {
        sewnStock[r.styleName] = (sewnStock[r.styleName] || 0) - r.quantity;
    });
    return Object.entries(sewnStock)
        .filter(([, quantity]) => quantity > 0)
        .map(([styleName, quantity]) => ({ styleName, quantity }));
  },

  saveFinishingProcess: async (record: Omit<FinishingRecord, 'id' | 'totalAmount'>): Promise<FinishingRecord> => {
    await delay(700);
    const availableStock = await api.getAvailableSewingStock();
    const styleStock = availableStock.find(s => s.styleName === record.styleName);
    if (!styleStock || styleStock.quantity < record.quantity) {
      throw new Error("Insufficient sewing stock to issue for finishing.");
    }

    const newRecord: FinishingRecord = {
      ...record,
      id: `FIN-${(finishingRecords.length + 1).toString().padStart(3, '0')}`,
      totalAmount: record.quantity * record.rate,
    };
    finishingRecords.push(newRecord);

    // Add to stock
    const existingStock = stockItems.find(item => item.itemName === record.styleName && item.category === 'Finished Goods');
    if (existingStock) {
        existingStock.quantity += record.quantity;
        existingStock.totalValue = existingStock.quantity * existingStock.unitPrice;
    } else {
        const newStockItem: StockItem = {
            id: `STK-${(stockItems.length + 1).toString().padStart(3, '0')}`,
            itemName: record.styleName,
            category: 'Finished Goods',
            quantity: record.quantity,
            unit: 'pcs',
            unitPrice: record.rate, // Assumption: finishing rate is the unit price
            totalValue: record.quantity * record.rate,
        };
        stockItems.push(newStockItem);
    }

    return newRecord;
  },

  saveRawMaterial: async (material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> => {
      await delay(500);
      const newMaterial: RawMaterial = {
          ...material,
          id: `MAT-${(rawMaterials.length + 1).toString().padStart(3, '0')}`
      };
      rawMaterials.push(newMaterial);
      return newMaterial;
  },

  saveShipment: async (shipment: Omit<Shipment, 'id'>): Promise<Shipment> => {
      await delay(600);
      const stockItem = stockItems.find(item => item.itemName === shipment.itemName && item.category === 'Finished Goods');
      if (!stockItem) throw new Error("Stock item not found.");
      if (stockItem.quantity < shipment.quantity) throw new Error("Insufficient stock for shipment.");

      stockItem.quantity -= shipment.quantity;
      stockItem.totalValue = stockItem.quantity * stockItem.unitPrice;

      const newShipment: Shipment = {
          ...shipment,
          id: `SHP-${(shipments.length + 1).toString().padStart(3, '0')}`
      };
      shipments.push(newShipment);
      return newShipment;
  }
};