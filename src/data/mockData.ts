// Mock data for Petrol Pump Management Dashboard

export interface Nozzleman {
  id: string;
  name: string;
  employeeId: string;
  mobile: string;
  email: string;
  status: "Active" | "Inactive" | "On Leave";
  assignedNozzles: string[];
  assignedPump: string;
  shift: "Morning" | "Evening" | "Night";
  joinDate: string;
  rating: number;
  totalShifts: number;
  totalFuelDispensed: number;
  averageCashHandled: number;
  certifications: string[];
}

export interface NozzleAssignment {
  id: string;
  nozzlemanId: string;
  nozzlemanName: string;
  nozzleId: string;
  nozzleName: string;
  pumpId: string;
  pumpName: string;
  assignedDate: string;
  shift: "Morning" | "Evening" | "Night";
  status: "Active" | "Completed" | "Cancelled";
  startTime?: string;
  endTime?: string;
}

export interface Pump {
  id: string;
  name: string;
  fuelType: "Petrol" | "Diesel" | "CNG";
  status: "Active" | "Maintenance" | "Inactive";
  assignedNozzles: number;
  lastCalibration: string;
  nozzleIds: string[];
}

export interface Nozzle {
  id: string;
  name: string;
  pumpId: string;
  number: number;
  status: "Active" | "Faulty";
  lastReading: number;
}

export interface Shift {
  id: string;
  nozzleman: string;
  pumpId: string;
  startTime: string;
  endTime?: string;
  openingReading: number;
  closingReading?: number;
  fuelDispensed: number;
  cashCollected?: number;
  status: "Active" | "Completed" | "Pending Approval";
  remarks?: string;
}

export interface FuelStock {
  id: string;
  tankId: string;
  product: "Petrol" | "Diesel" | "CNG";
  capacity: number;
  openingStock: number;
  received: number;
  sold: number;
  closingStock: number;
  currentLevel: number;
  lastUpdated: string;
  alert: boolean;
}

export interface Sale {
  id: string;
  transactionId: string;
  date: string;
  time: string;
  product: "Petrol" | "Diesel" | "CNG";
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  paymentMode: "Cash" | "Credit" | "Card" | "UPI";
  nozzleman: string;
  customerName?: string;
}

export const mockPumps: Pump[] = [
  {
    id: "P001",
    name: "Pump 1",
    fuelType: "Petrol",
    status: "Active",
    assignedNozzles: 4,
    lastCalibration: "2024-01-15",
    nozzleIds: ["N001", "N002", "N003", "N004"],
  },
  {
    id: "P002",
    name: "Pump 2",
    fuelType: "Diesel",
    status: "Active",
    assignedNozzles: 3,
    lastCalibration: "2024-01-20",
    nozzleIds: ["N005", "N006", "N007"],
  },
  {
    id: "P003",
    name: "Pump 3",
    fuelType: "CNG",
    status: "Maintenance",
    assignedNozzles: 2,
    lastCalibration: "2023-12-10",
    nozzleIds: ["N008", "N009"],
  },
  {
    id: "P004",
    name: "Pump 4",
    fuelType: "Petrol",
    status: "Active",
    assignedNozzles: 4,
    lastCalibration: "2024-02-01",
    nozzleIds: ["N010", "N011", "N012", "N013"],
  },
];

export const mockNozzles: Nozzle[] = [
  { id: "N001", name: "Nozzle 1", pumpId: "P001", number: 1, status: "Active", lastReading: 125678 },
  { id: "N002", name: "Nozzle 2", pumpId: "P001", number: 2, status: "Active", lastReading: 98456 },
  { id: "N003", name: "Nozzle 3", pumpId: "P001", number: 3, status: "Active", lastReading: 156789 },
  { id: "N004", name: "Nozzle 4", pumpId: "P001", number: 4, status: "Faulty", lastReading: 87654 },
  { id: "N005", name: "Nozzle 5", pumpId: "P002", number: 1, status: "Active", lastReading: 234567 },
  { id: "N006", name: "Nozzle 6", pumpId: "P002", number: 2, status: "Active", lastReading: 189456 },
  { id: "N007", name: "Nozzle 7", pumpId: "P002", number: 3, status: "Active", lastReading: 276543 },
  { id: "N008", name: "Nozzle 8", pumpId: "P003", number: 1, status: "Active", lastReading: 45678 },
  { id: "N009", name: "Nozzle 9", pumpId: "P003", number: 2, status: "Active", lastReading: 56789 },
];

export const mockNozzlemen: Nozzleman[] = [
  { id: "NM-001", name: "Rahul Kumar", employeeId: "EMP-001", mobile: "+91 98765 43210", email: "rahul@example.com", status: "Active", assignedNozzles: ["N001", "N002"], assignedPump: "P001", shift: "Morning", joinDate: "2023-01-15", rating: 4.5, totalShifts: 450, totalFuelDispensed: 125000, averageCashHandled: 85000, certifications: ["Basic Safety", "Fire Safety"] },
  { id: "NM-002", name: "Amit Sharma", employeeId: "EMP-002", mobile: "+91 98765 43211", email: "amit@example.com", status: "Active", assignedNozzles: ["N003"], assignedPump: "P001", shift: "Evening", joinDate: "2023-03-20", rating: 4.2, totalShifts: 380, totalFuelDispensed: 98000, averageCashHandled: 72000, certifications: ["Basic Safety"] },
];

export const mockNozzleAssignments: NozzleAssignment[] = [
  { id: "NA-001", nozzlemanId: "NM-001", nozzlemanName: "Rahul Kumar", nozzleId: "N001", nozzleName: "Nozzle 1", pumpId: "P001", pumpName: "Pump 1 - Petrol", assignedDate: "2025-01-08", shift: "Morning", status: "Active", startTime: "06:00 AM", endTime: "02:00 PM" },
  { id: "NA-002", nozzlemanId: "NM-001", nozzlemanName: "Rahul Kumar", nozzleId: "N002", nozzleName: "Nozzle 2", pumpId: "P001", pumpName: "Pump 1 - Petrol", assignedDate: "2025-01-08", shift: "Morning", status: "Active", startTime: "06:00 AM", endTime: "02:00 PM" },
];

export const mockShifts: Shift[] = [
  {
    id: "S001",
    nozzleman: "Rajesh Kumar",
    pumpId: "P001",
    startTime: "2024-02-15T06:00:00",
    endTime: "2024-02-15T14:00:00",
    openingReading: 125000,
    closingReading: 128500,
    fuelDispensed: 3500,
    cashCollected: 350000,
    status: "Completed",
    remarks: "Smooth shift",
  },
  {
    id: "S002",
    nozzleman: "Amit Sharma",
    pumpId: "P002",
    startTime: "2024-02-15T14:00:00",
    openingReading: 234000,
    fuelDispensed: 1200,
    status: "Active",
  },
  {
    id: "S003",
    nozzleman: "Priya Singh",
    pumpId: "P004",
    startTime: "2024-02-15T06:00:00",
    endTime: "2024-02-15T14:00:00",
    openingReading: 98000,
    closingReading: 99800,
    fuelDispensed: 1800,
    cashCollected: 180000,
    status: "Pending Approval",
  },
];

export const mockFuelStock: FuelStock[] = [
  {
    id: "FS001",
    tankId: "T001",
    product: "Petrol",
    capacity: 50000,
    openingStock: 45000,
    received: 5000,
    sold: 8500,
    closingStock: 41500,
    currentLevel: 83,
    lastUpdated: "2024-02-15T14:30:00",
    alert: false,
  },
  {
    id: "FS002",
    tankId: "T002",
    product: "Diesel",
    capacity: 60000,
    openingStock: 12000,
    received: 0,
    sold: 3200,
    closingStock: 8800,
    currentLevel: 15,
    lastUpdated: "2024-02-15T14:30:00",
    alert: true,
  },
  {
    id: "FS003",
    tankId: "T003",
    product: "CNG",
    capacity: 30000,
    openingStock: 28000,
    received: 2000,
    sold: 1500,
    closingStock: 28500,
    currentLevel: 95,
    lastUpdated: "2024-02-15T14:30:00",
    alert: false,
  },
];

export const mockSales: Sale[] = [
  {
    id: "SL001",
    transactionId: "TXN20240215001",
    date: "2024-02-15",
    time: "08:30:00",
    product: "Petrol",
    quantity: 45,
    pricePerLiter: 105.5,
    totalAmount: 4747.5,
    paymentMode: "Cash",
    nozzleman: "Rajesh Kumar",
    customerName: "Walk-in Customer",
  },
  {
    id: "SL002",
    transactionId: "TXN20240215002",
    date: "2024-02-15",
    time: "09:15:00",
    product: "Diesel",
    quantity: 60,
    pricePerLiter: 95.0,
    totalAmount: 5700,
    paymentMode: "UPI",
    nozzleman: "Amit Sharma",
    customerName: "Transport Co.",
  },
  {
    id: "SL003",
    transactionId: "TXN20240215003",
    date: "2024-02-15",
    time: "10:00:00",
    product: "Petrol",
    quantity: 30,
    pricePerLiter: 105.5,
    totalAmount: 3165,
    paymentMode: "Card",
    nozzleman: "Priya Singh",
  },
  {
    id: "SL004",
    transactionId: "TXN20240215004",
    date: "2024-02-15",
    time: "11:30:00",
    product: "CNG",
    quantity: 20,
    pricePerLiter: 85.0,
    totalAmount: 1700,
    paymentMode: "Cash",
    nozzleman: "Rajesh Kumar",
  },
];

// Phase 7: Credit Customer & Ledger
export interface CreditCustomer {
  id: string;
  name: string;
  mobile: string;
  creditLimit: number;
  balance: number;
  status: "Active" | "Suspended" | "Inactive";
  address?: string;
  registeredDate: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  type: "Credit" | "Debit";
  amount: number;
  remarks: string;
  addedBy: string;
}

export const mockCreditCustomers: CreditCustomer[] = [
  {
    id: "CC001",
    name: "ABC Transport Ltd",
    mobile: "+91 98765 43210",
    creditLimit: 500000,
    balance: 125000,
    status: "Active",
    address: "123 Main Street, Delhi",
    registeredDate: "2023-06-15",
  },
  {
    id: "CC002",
    name: "XYZ Logistics",
    mobile: "+91 98765 43211",
    creditLimit: 300000,
    balance: 85000,
    status: "Active",
    address: "456 Park Avenue, Mumbai",
    registeredDate: "2023-08-20",
  },
  {
    id: "CC003",
    name: "PQR Industries",
    mobile: "+91 98765 43212",
    creditLimit: 200000,
    balance: 0,
    status: "Inactive",
    address: "789 Industrial Area, Pune",
    registeredDate: "2023-03-10",
  },
];

export const mockLedger: LedgerEntry[] = [
  {
    id: "LE001",
    date: "2024-02-15",
    customerId: "CC001",
    customerName: "ABC Transport Ltd",
    type: "Debit",
    amount: 50000,
    remarks: "Fuel purchase - Invoice #INV001",
    addedBy: "Admin",
  },
  {
    id: "LE002",
    date: "2024-02-14",
    customerId: "CC001",
    customerName: "ABC Transport Ltd",
    type: "Credit",
    amount: 25000,
    remarks: "Payment received - Cash",
    addedBy: "Cashier",
  },
  {
    id: "LE003",
    date: "2024-02-13",
    customerId: "CC002",
    customerName: "XYZ Logistics",
    type: "Debit",
    amount: 35000,
    remarks: "Diesel bulk order",
    addedBy: "Manager",
  },
];

// Phase 8: Expense & Cash Management
export interface Expense {
  _id: string; // Change from id to _id
  category: string;
  amount: number;
  addedBy: string;
  notes: string;
  approvedBy?: string;
  date: string;
  // Keep id for backward compatibility if needed
  id?: string;
}
export interface CashHandover {
  id: string;
  shiftId: string;
  operator: string;
  amount: number;
  status: "Pending" | "Verified" | "Discrepancy";
  verifiedBy?: string;
  date: string;
  remarks?: string;
}


export const mockCashHandovers: CashHandover[] = [
  {
    id: "CH001",
    shiftId: "S001",
    operator: "Rajesh Kumar",
    amount: 350000,
    status: "Verified",
    verifiedBy: "Manager",
    date: "2024-02-15",
  },
  {
    id: "CH002",
    shiftId: "S003",
    operator: "Priya Singh",
    amount: 180000,
    status: "Pending",
    date: "2024-02-15",
  },
];

// Phase 9: Price & Product Management
export interface Product {
  id: string;
  name: string;
  type: "Petrol" | "Diesel" | "CNG" | "Lubricant" | "Accessory";
  currentPrice: number;
  unit: "Liter" | "Piece" | "Kg";
  status: "Active" | "Inactive";
  lastUpdated: string;
}

export interface PriceHistory {
  id: string;
  date: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  updatedBy: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
}

export const mockProducts: Product[] = [
  {
    id: "PR001",
    name: "Petrol (Premium)",
    type: "Petrol",
    currentPrice: 105.5,
    unit: "Liter",
    status: "Active",
    lastUpdated: "2024-02-01",
  },
  {
    id: "PR002",
    name: "Diesel",
    type: "Diesel",
    currentPrice: 95.0,
    unit: "Liter",
    status: "Active",
    lastUpdated: "2024-02-01",
  },
  {
    id: "PR003",
    name: "CNG",
    type: "CNG",
    currentPrice: 85.0,
    unit: "Kg",
    status: "Active",
    lastUpdated: "2024-01-15",
  },
  {
    id: "PR004",
    name: "Engine Oil 5W-30",
    type: "Lubricant",
    currentPrice: 450,
    unit: "Liter",
    status: "Active",
    lastUpdated: "2024-01-20",
  },
];

export const mockPriceHistory: PriceHistory[] = [
  {
    id: "PH001",
    date: "2024-02-15",
    productId: "PR001",
    productName: "Petrol (Premium)",
    oldPrice: 104.0,
    newPrice: 105.5,
    updatedBy: "Admin",
    status: "Approved",
    approvedBy: "Manager",
  },
  {
    id: "PH002",
    date: "2024-02-14",
    productId: "PR002",
    productName: "Diesel",
    oldPrice: 93.5,
    newPrice: 95.0,
    updatedBy: "Admin",
    status: "Pending",
  },
];

// Phase 10: Audit & Compliance
export interface AuditDiscrepancy {
  id: string;
  date: string;
  module: "Stock" | "Cash" | "Sales" | "Meter" | "Shift";
  issueType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  details: string;
  status: "Open" | "Investigating" | "Resolved";
  assignedTo?: string;
}

export interface AuditTrail {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  remarks: string;
}

export const mockAuditDiscrepancies: AuditDiscrepancy[] = [
  {
    id: "AD001",
    date: "2024-02-15",
    module: "Stock",
    issueType: "Stock Mismatch",
    severity: "High",
    details: "Diesel tank reading differs by 500L from system",
    status: "Investigating",
    assignedTo: "Auditor",
  },
  {
    id: "AD002",
    date: "2024-02-14",
    module: "Cash",
    issueType: "Cash Variance",
    severity: "Medium",
    details: "₹2,500 shortage in Shift S003",
    status: "Open",
  },
  {
    id: "AD003",
    date: "2024-02-13",
    module: "Meter",
    issueType: "Reading Error",
    severity: "Low",
    details: "Nozzle N004 meter reading anomaly",
    status: "Resolved",
    assignedTo: "Technician",
  },
];

export const mockAuditTrail: AuditTrail[] = [
  {
    id: "AT001",
    timestamp: "2024-02-15T14:30:00",
    user: "Admin",
    action: "Updated Price",
    entity: "Product PR001",
    remarks: "Price change from ₹104 to ₹105.5",
  },
  {
    id: "AT002",
    timestamp: "2024-02-15T12:15:00",
    user: "Manager",
    action: "Approved Shift",
    entity: "Shift S001",
    remarks: "Shift completed successfully",
  },
  {
    id: "AT003",
    timestamp: "2024-02-15T10:00:00",
    user: "Cashier",
    action: "Added Payment",
    entity: "Customer CC001",
    remarks: "Payment of ₹25,000 received",
  },
];

// Phase 11: Notifications & Alerts
export interface Notification {
  id: string;
  date: string;
  type: "Critical" | "Info" | "Maintenance" | "Stock" | "Audit" | "Payment";
  message: string;
  severity: "High" | "Medium" | "Low";
  status: "Unread" | "Read";
  module: string;
}

export const mockNotifications: Notification[] = [
  {
    id: "NOT001",
    date: "2024-02-15T14:30:00",
    type: "Critical",
    message: "Diesel stock below 20% - Immediate refill required",
    severity: "High",
    status: "Unread",
    module: "Stock",
  },
  {
    id: "NOT002",
    date: "2024-02-15T12:00:00",
    type: "Stock",
    message: "New stock delivery scheduled for tomorrow",
    severity: "Low",
    status: "Read",
    module: "Stock",
  },
  {
    id: "NOT003",
    date: "2024-02-15T10:30:00",
    type: "Maintenance",
    message: "Pump P003 calibration due in 7 days",
    severity: "Medium",
    status: "Unread",
    module: "Maintenance",
  },
  {
    id: "NOT004",
    date: "2024-02-15T09:00:00",
    type: "Audit",
    message: "Stock audit discrepancy detected",
    severity: "High",
    status: "Read",
    module: "Audit",
  },
  {
    id: "NOT005",
    date: "2024-02-14T18:00:00",
    type: "Payment",
    message: "ABC Transport Ltd payment of ₹25,000 received",
    severity: "Low",
    status: "Read",
    module: "Credit",
  },
];
