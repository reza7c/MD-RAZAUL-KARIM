
export interface Employee {
  ID: string;
  Name: string;
  Designation: string;
  Department: string;
  DOJ: string;
  Type: string; // Employee Type
  Status: 'Active' | 'Inactive'; // Employee Status
  Salary: number;
  'Separation Date'?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  supplier: string;
}

export interface ProductionSizeQuantities {
  s: number;
  m: number;
  l: number;
  xl: number;
  xxl: number;
}

export interface CuttingRecord extends ProductionSizeQuantities {
  id: string;
  styleName: string;
  employeeId: string;
  employeeName: string;
  materialUsedId: string;
  materialUsedName: string;
  fabricUsed: number;
  unit: string;
  total: number;
  rate: number;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
}

export interface SewingRecord extends ProductionSizeQuantities {
  id: string;
  styleName: string;
  employeeId: string;
  employeeName: string;
  total: number;
  rate: number;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
}

export interface FinishingRecord {
  id: string;
  styleName: string;
  employeeId: string;
  employeeName: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  date: string;
  status: 'Completed' | 'Pending';
}

export interface StockItem {
  id: string;
  itemName: string;
  category: 'Finished Goods' | 'Raw Material' | 'Accessories';
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
}

export interface Shipment {
  id: string;
  orderNumber: string;
  customer: string;
  itemName: string;
  quantity: number;
  value: number;
  shipmentDate: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
  destination: string;
}

export interface Settings {
    departments: string[];
    designations: string[];
    empTypes: string[];
    empStatus: ('Active' | 'Inactive')[];
    styleNames: string[];
}
