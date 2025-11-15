// types/index.ts
export interface Nozzleman {
  _id: string;
  employeeId: string;
  name: string;
  email?: string; // Make optional since your backend model doesn't have it
  mobile: string;
  shift: string;
  status: string;
  assignedPump?: {
    _id: string;
    name: string;
  };
  assignedNozzles: any[];
  rating: number;
  totalShifts: number;
  totalFuelDispensed: number;
  averageCashHandled: number;
  certifications?: string[]; // Make optional
  joinDate: string;
}

export interface Pump {
  _id: string;
  name: string;
  location: string;
  fuelType: string;
  status: string;
  currentReading: number;
  totalSales: number;
  lastCalibration: string;
  nozzles: any[];
  createdAt: string;
}

export interface Nozzle {
  _id: string;
  number: string;
  pump: {
    _id: string;
    name: string;
  };
  fuelType: string;
  status: string;
  currentReading: number;
  totalDispensed: number;
  lastCalibration: string;
  rate: number;
}

export interface Assignment {
  _id: string;
  nozzleman: {
    _id: string;
    name: string;
  };
  nozzle: {
    _id: string;
    number: string;
  };
  pump: {
    _id: string;
    name: string;
  };
  shift: string;
  assignedDate: string;
  startTime?: string;
  endTime?: string;
  status: string;
}

export interface Shift {
  _id: string;
  shiftId: string;
  nozzleman: {
    _id: string;
    name: string;
  };
  pump: {
    _id: string;
    name: string;
  };
  nozzle: {
    _id: string;
    number: string;
  };
  startTime: string;
  endTime?: string;
  startReading: number;
  endReading?: number;
  fuelDispensed: number;
  cashCollected: number;
  status: string;
  notes?: string;
}