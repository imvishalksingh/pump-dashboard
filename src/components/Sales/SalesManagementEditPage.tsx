import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { 
  Edit, Save, X, RefreshCw, Search, DollarSign, Fuel, TestTube, 
  Wallet, CreditCard, Smartphone, User, Building, Calendar, 
  Trash2, Download, Plus, List, PlayCircle, Power, 
  History, Zap, Droplets, Target, Users, Circle, ArrowLeft, ArrowRight,
  Hash, TrendingUp, CheckCircle2, Calculator, BarChart3, Clock,
  FileText, Truck, Receipt, Filter, SortAsc, SortDesc,
  Eye, EyeOff, Printer, FileSpreadsheet, MoreVertical,
  ChevronDown, ChevronUp, AlertCircle, Info, Shield, Lock
} from "lucide-react";
import { format, parseISO, addMinutes, subMinutes, differenceInMinutes } from "date-fns";

// --- INTERFACES ---

interface Shift {
  _id: string;
  shiftId: string;
  nozzleman: { _id: string; name: string; employeeId: string; };
  pump: { _id: string; name: string; location: string; fuelType: string; };
  nozzle: { _id: string; number: string; fuelType: string; };
  nozzleReadings?: NozzleReading[];
  startTime: string;
  endTime: string;
  startReading: number;
  endReading: number;
  fuelDispensed: number;
  testingFuel: number;
  cashCollected: number;
  phonePeSales: number;
  posSales: number;
  otpSales: number;
  creditSales: number;
  expenses: number;
  cashDeposit: number;
  cashInHand: number;
  status: "Active" | "Completed" | "Pending Approval" | "Approved" | "Rejected";
  notes?: string;
  auditNotes?: string;
  isManualEntry: boolean;
  isSimpleStart?: boolean;
  cashSalesRecords?: CashRecord[];
  phonePeRecords?: DigitalRecord[];
  posRecords?: DigitalRecord[];
  fuelRecords?: FuelRecord[];
  testingRecords?: TestingRecord[];
  expenseRecords?: ExpenseRecord[];
  creditRecords?: CreditRecord[];
  createdAt: string;
  updatedAt: string;
}

interface CashRecord {
  _id?: string;
  amount: number;
  time: string;
  notes?: string;
  billNumber?: string;
  vehicleNumber?: string;
  paymentMethod?: "cash" | "card" | "upi";
  date?: string;
}

interface DigitalRecord {
  _id?: string;
  amount: number;
  time: string;
  transactionId: string;
  customerName?: string;
  notes?: string;
  date?: string;
}

interface NozzleReading {
  _id?: string;
  nozzle: { _id: string; number: string; fuelType: string; };
  nozzleNumber: string;
  fuelType: string;
  openingReading: number;
  closingReading: number | null;
  fuelDispensed: number;
  rate?: number;
  salesAmount?: number;
  testingFuel?: number;
}

interface FuelRecord {
  _id?: string;
  liters: number;
  amount: number;
  time: string;
  vehicleNumber?: string;
  fuelType: string;
  nozzleNumber: string;
  notes?: string;
  date?: string;
}

interface TestingRecord {
  _id?: string;
  liters: number;
  time: string;
  testedBy: string;
  notes?: string;
  date?: string;
}

interface ExpenseRecord {
  _id?: string;
  amount: number;
  time: string;
  category: string;
  description: string;
  receiptNumber?: string;
  date?: string;
}

interface CreditRecord {
  _id?: string;
  amount: number;
  time: string;
  customerId: string;
  customerName?: string;
  vehicleNumber?: string;
  notes?: string;
  date?: string;
  status?: "pending" | "paid";
}

interface Nozzleman {
  _id: string;
  name: string;
  employeeId: string;
  assignedNozzles?: any[];
  assignedPump?: { _id: string; name: string; };
}

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  balance: number;
  creditLimit: number;
  address?: string;
  email?: string;
}

// --- MAIN COMPONENT ---

export const SalesManagementEditPage = () => {
  // --- STATE MANAGEMENT ---
  
  // View Modes
  const [viewMode, setViewMode] = useState<'dashboard' | 'ledger'>('dashboard');
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [activeLedgerType, setActiveLedgerType] = useState<'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit' | 'cashDeposit'>('cash');

  // Data State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [nozzlemen, setNozzlemen] = useState<Nozzleman[]>([]);
  const [pumps, setPumps] = useState<any[]>([]);
  const [nozzles, setNozzles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [nozzlemanFilter, setNozzlemanFilter] = useState("all");
  const [selectedNozzles, setSelectedNozzles] = useState<string[]>([]);

  // Editing State
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isEndingShift, setIsEndingShift] = useState(false);

  // Quick Start / Bulk Start State
  const [quickStarting, setQuickStarting] = useState<string | null>(null);
  const [quickStartingMultiple, setQuickStartingMultiple] = useState(false);
  const [startNewShiftDialog, setStartNewShiftDialog] = useState({ open: false, nozzleman: null as Nozzleman | null });
  const [newShiftForm, setNewShiftForm] = useState({
    nozzlemanId: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: ""
  });

  // Ledger State
  const [ledgerForm, setLedgerForm] = useState({
    amount: "",
    liters: "",
    note: "",
    vehicleNumber: "",
    billNumber: "",
    transactionId: "",
    customerId: "",
    category: "",
    fuelType: "Petrol",
    testedBy: "",
    receiptNumber: "",
    paymentMethod: "cash" as "cash" | "card" | "upi",
    customerName: ""
  });

  // Calculator State (for quick entry within ledger)
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState("");
  const [calculatorHistory, setCalculatorHistory] = useState<string[]>([]);
  const calculatorInputRef = useRef<HTMLInputElement>(null);

  // Ledger Filter/Sort State
  const [ledgerFilter, setLedgerFilter] = useState({
    search: "",
    minAmount: "",
    maxAmount: "",
    dateRange: "today" as "today" | "yesterday" | "week" | "month" | "all",
    sortBy: "time" as "time" | "amount" | "date",
    sortOrder: "desc" as "asc" | "desc"
  });

  // Batch Operations
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Stats State
  const [ledgerStats, setLedgerStats] = useState({
    total: 0,
    count: 0,
    average: 0,
    highest: 0,
    lowest: 0,
    hourlyRate: 0
  });

  const { toast } = useToast();
  const amountInputRef = useRef<HTMLInputElement>(null);

  // --- API CALLS ---

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [shiftsRes, nozzlemenRes, pumpsRes, nozzlesRes, customersRes] = await Promise.all([
        api.get("/api/shifts?limit=500&populate=nozzleReadings.nozzle"), 
        api.get("/api/nozzlemen?populate=assignedNozzles,assignedPump"), 
        api.get("/api/pumps"),
        api.get("/api/nozzles"),
        api.get("/api/customers")
      ]);
      
      let shiftsData = shiftsRes.data.data || shiftsRes.data.shifts || [];
      if(!Array.isArray(shiftsData)) shiftsData = [shiftsData];

      // Normalize data
      const shiftsWithRecords = shiftsData.map((shift: any) => ({
        ...shift,
        cashSalesRecords: shift.cashSalesRecords || [],
        phonePeRecords: shift.phonePeRecords || [],
        posRecords: shift.posRecords || [],
        fuelRecords: shift.fuelRecords || [],
        testingRecords: shift.testingRecords || [],
        expenseRecords: shift.expenseRecords || [],
        creditRecords: shift.creditRecords || [],
        nozzleReadings: shift.nozzleReadings || []
      }));
      
      setShifts(shiftsWithRecords);
      setNozzlemen(nozzlemenRes.data.data || nozzlemenRes.data || []);
      setPumps(pumpsRes.data.data || pumpsRes.data || []);
      setNozzles(nozzlesRes.data.data || nozzlesRes.data || []);
      setCustomers(customersRes.data.data || customersRes.data || []);
      
    } catch (error: any) {
      console.error("Failed to fetch data", error);
      toast({ title: "Error", description: "Could not load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const refreshSingleShift = async (shiftId: string) => {
    try {
        const res = await api.get(`/api/shifts/${shiftId}`);
        const updatedShift = res.data; 

        setShifts(prevShifts => 
            prevShifts.map(s => s._id === shiftId ? { ...updatedShift, 
                cashSalesRecords: updatedShift.cashSalesRecords || [],
                phonePeRecords: updatedShift.phonePeRecords || [],
                posRecords: updatedShift.posRecords || [],
                fuelRecords: updatedShift.fuelRecords || [],
                testingRecords: updatedShift.testingRecords || [],
                expenseRecords: updatedShift.expenseRecords || [],
                creditRecords: updatedShift.creditRecords || [],
                nozzleReadings: updatedShift.nozzleReadings || []
            } : s)
        );
    } catch (e) {
        console.error("Failed to refresh single shift", e);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    let filtered = shifts;
    if (searchTerm) {
      filtered = filtered.filter(shift =>
        shift.shiftId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.nozzleman.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter(shift => shift.status === statusFilter);
    if (dateFilter) filtered = filtered.filter(shift => shift.startTime.startsWith(dateFilter));
    if (nozzlemanFilter !== "all") filtered = filtered.filter(shift => shift.nozzleman._id === nozzlemanFilter);
    setFilteredShifts(filtered);
  }, [shifts, searchTerm, statusFilter, dateFilter, nozzlemanFilter]);

  // --- LEDGER FUNCTIONS ---

  const enterLedgerMode = (shiftId: string, type: typeof activeLedgerType) => {
    setActiveShiftId(shiftId);
    setActiveLedgerType(type);
    setViewMode('ledger');
    // Reset form
    setLedgerForm({
      amount: "", liters: "", note: "", vehicleNumber: "", billNumber: "",
      transactionId: "", customerId: "", category: "", fuelType: "Petrol",
      testedBy: "", receiptNumber: "", paymentMethod: "cash", customerName: ""
    });
    // Reset filters
    setLedgerFilter({
      search: "",
      minAmount: "",
      maxAmount: "",
      dateRange: "today",
      sortBy: "time",
      sortOrder: "desc"
    });
    setSelectedRecords([]);
    setShowBulkActions(false);
    // Auto focus after render
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setActiveShiftId(null);
    setShowCalculator(false);
  };

  const handleAddRecord = async () => {
    if (!activeShiftId) return;
    
    const currentShift = shifts.find(s => s._id === activeShiftId);
    if (!currentShift) return;

    const amountVal = parseFloat(ledgerForm.amount);
    const litersVal = parseFloat(ledgerForm.liters);

    // Validation
    if ((activeLedgerType === 'fuel' || activeLedgerType === 'testing') && (!litersVal || litersVal <= 0)) {
      toast({ title: "Error", description: "Please enter valid liters", variant: "destructive" });
      return;
    }
    if (activeLedgerType !== 'fuel' && activeLedgerType !== 'testing' && (!amountVal || amountVal <= 0)) {
      toast({ title: "Error", description: "Please enter valid amount", variant: "destructive" });
      return;
    }
    if (activeLedgerType === 'credit' && !ledgerForm.customerId) {
        toast({ title: "Error", description: "Select a customer", variant: "destructive" });
        return;
    }

    try {
      setSaving(true);
      const payload: any = {
        shiftId: activeShiftId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: ledgerForm.note,
        date: new Date().toISOString()
      };

      // Type specific payloads
      if (activeLedgerType === 'credit') {
        await api.post('/api/customers/sync-sale', {
            ...payload,
            customerId: ledgerForm.customerId,
            amount: amountVal,
            vehicleNumber: ledgerForm.vehicleNumber
        });
        toast({ title: "Success", description: "Credit sale added" });
      } 
      else if (activeLedgerType === 'expenses') {
         await api.post('/api/expenses', {
           ...payload,
           amount: amountVal,
           category: ledgerForm.category || 'Other',
           description: ledgerForm.note || 'Shift Expense',
           nozzleman: currentShift.nozzleman._id
         });
         const currentTotal = currentShift.expenses || 0;
         await api.put(`/api/shifts/${activeShiftId}`, { expenses: currentTotal + amountVal });
         toast({ title: "Success", description: "Expense logged" });
      }
      else if (activeLedgerType === 'cashDeposit') {
          await api.post('/api/cash-handovers', {
             shift: activeShiftId,
             nozzleman: currentShift.nozzleman._id,
             amount: amountVal,
             status: 'Pending',
             notes: ledgerForm.note
          });
          const currentTotal = currentShift.cashDeposit || 0;
          await api.put(`/api/shifts/${activeShiftId}`, { cashDeposit: currentTotal + amountVal });
          toast({ title: "Success", description: "Deposit recorded" });
      }
      else {
        const recordData = {
            amount: amountVal,
            liters: litersVal,
            ...payload,
            billNumber: ledgerForm.billNumber,
            vehicleNumber: ledgerForm.vehicleNumber,
            transactionId: ledgerForm.transactionId,
            fuelType: ledgerForm.fuelType,
            ...(activeLedgerType === 'cash' ? { paymentMethod: ledgerForm.paymentMethod } : {}),
            ...(activeLedgerType === 'testing' ? { testedBy: ledgerForm.testedBy || currentShift.nozzleman.name } : {}),
            ...(activeLedgerType === 'expenses' ? { receiptNumber: ledgerForm.receiptNumber } : {})
        };

        await api.post(`/api/shifts/${activeShiftId}/add-record`, {
            type: activeLedgerType,
            record: recordData
        });
        toast({ title: "Success", description: "Record added" });
      }

      await refreshSingleShift(activeShiftId);
      
      // Reset form but keep customer if credit
      setLedgerForm(prev => ({
        ...prev,
        amount: "", 
        liters: "", 
        note: "", 
        vehicleNumber: "", 
        billNumber: "", 
        transactionId: "",
        ...(activeLedgerType !== 'credit' ? { customerId: "" } : {})
      }));
      setTimeout(() => amountInputRef.current?.focus(), 50);

    } catch (error: any) {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to add record", variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  // --- CALCULATOR FUNCTIONS ---

  const handleCalculatorInput = (value: string) => {
    if (value === 'clear') {
      setCalculatorValue("");
    } else if (value === 'backspace') {
      setCalculatorValue(prev => prev.slice(0, -1));
    } else if (value === '=') {
      try {
        // Evaluate the expression
        const result = eval(calculatorValue.replace(/[^-()\d/*+.]/g, ''));
        setCalculatorValue(result.toString());
        setCalculatorHistory(prev => [...prev, `${calculatorValue} = ${result}`]);
      } catch {
        setCalculatorValue("Error");
      }
    } else if (value === 'transfer') {
      // Transfer calculator value to form
      const numValue = parseFloat(calculatorValue) || 0;
      if (activeLedgerType === 'fuel' || activeLedgerType === 'testing') {
        setLedgerForm(prev => ({ ...prev, liters: numValue.toString() }));
      } else {
        setLedgerForm(prev => ({ ...prev, amount: numValue.toString() }));
      }
      setShowCalculator(false);
      setTimeout(() => amountInputRef.current?.focus(), 50);
    } else {
      setCalculatorValue(prev => prev + value);
    }
  };

  const openQuickCalculator = () => {
    setShowCalculator(true);
    setCalculatorValue("");
    setTimeout(() => calculatorInputRef.current?.focus(), 50);
  };

  // --- LEDGER UTILITIES ---

  const getRecords = (shift: Shift, type: string) => {
      switch(type) {
          case 'cash': return shift.cashSalesRecords || [];
          case 'phonepe': return shift.phonePeRecords || [];
          case 'pos': return shift.posRecords || [];
          case 'fuel': return shift.fuelRecords || [];
          case 'testing': return shift.testingRecords || [];
          case 'expenses': return shift.expenseRecords || [];
          case 'credit': return shift.creditRecords || [];
          case 'cashDeposit': return []; // Usually handled separately
          default: return [];
      }
  };

  const getTotal = (shift: Shift, type: string) => {
      if (type === 'cashDeposit') return shift.cashDeposit || 0;
      if (type === 'expenses') return shift.expenses || 0;
      const records = getRecords(shift, type);
      const sum = records.reduce((acc: number, r: any) => acc + (r.amount || r.liters || 0), 0);
      
      // Fallback if records empty but total exists (legacy)
      if (sum === 0 && records.length === 0) {
           if(type === 'cash') return shift.cashCollected || 0;
           if(type === 'phonepe') return shift.phonePeSales || 0;
           if(type === 'pos') return shift.posSales || 0;
           if(type === 'credit') return shift.creditSales || 0;
           if(type === 'fuel') return shift.fuelDispensed || 0;
           if(type === 'testing') return shift.testingFuel || 0;
      }
      return sum;
  };

  const getThemeColor = (type: string) => {
      switch(type) {
          case 'cash': return 'green';
          case 'phonepe': return 'blue';
          case 'pos': return 'purple';
          case 'expenses': return 'red';
          case 'testing': return 'red';
          case 'cashDeposit': return 'yellow';
          case 'credit': return 'indigo';
          default: return 'gray';
      }
  };

  const getFilteredRecords = () => {
    const shift = shifts.find(s => s._id === activeShiftId);
    if (!shift) return [];

    let records = getRecords(shift, activeLedgerType);
    
    // Apply filters
    if (ledgerFilter.search) {
      const searchLower = ledgerFilter.search.toLowerCase();
      records = records.filter((record: any) => 
        record.notes?.toLowerCase().includes(searchLower) ||
        record.vehicleNumber?.toLowerCase().includes(searchLower) ||
        record.billNumber?.toLowerCase().includes(searchLower) ||
        record.transactionId?.toLowerCase().includes(searchLower) ||
        record.customerName?.toLowerCase().includes(searchLower) ||
        record.description?.toLowerCase().includes(searchLower)
      );
    }

    if (ledgerFilter.minAmount) {
      const min = parseFloat(ledgerFilter.minAmount);
      records = records.filter((record: any) => 
        (record.amount || record.liters || 0) >= min
      );
    }

    if (ledgerFilter.maxAmount) {
      const max = parseFloat(ledgerFilter.maxAmount);
      records = records.filter((record: any) => 
        (record.amount || record.liters || 0) <= max
      );
    }

    // Apply date range filter
    if (ledgerFilter.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch(ledgerFilter.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      records = records.filter((record: any) => {
        if (!record.date) return true;
        const recordDate = new Date(record.date);
        return recordDate >= startDate;
      });
    }

    // Apply sorting
    records.sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch(ledgerFilter.sortBy) {
        case 'time':
          aValue = a.time || '00:00';
          bValue = b.time || '00:00';
          break;
        case 'amount':
          aValue = a.amount || a.liters || 0;
          bValue = b.amount || b.liters || 0;
          break;
        case 'date':
          aValue = new Date(a.date || a.createdAt || 0).getTime();
          bValue = new Date(b.date || b.createdAt || 0).getTime();
          break;
        default:
          return 0;
      }
      
      if (ledgerFilter.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return records;
  };

  const calculateStats = () => {
    const records = getFilteredRecords();
    const values = records.map((r: any) => r.amount || r.liters || 0);
    
    if (values.length === 0) {
      setLedgerStats({
        total: 0,
        count: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        hourlyRate: 0
      });
      return;
    }

    const total = values.reduce((a: number, b: number) => a + b, 0);
    const average = total / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    
    // Calculate hourly rate if shift has duration
    const shift = shifts.find(s => s._id === activeShiftId);
    let hourlyRate = 0;
    if (shift && shift.startTime && shift.endTime) {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      const hours = differenceInMinutes(end, start) / 60;
      if (hours > 0) {
        hourlyRate = total / hours;
      }
    }

    setLedgerStats({
      total,
      count: values.length,
      average,
      highest,
      lowest,
      hourlyRate
    });
  };

  useEffect(() => {
    calculateStats();
  }, [activeShiftId, activeLedgerType, ledgerFilter]);

  // --- BATCH OPERATIONS ---

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    const records = getFilteredRecords();
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map((r: any) => r._id).filter(Boolean));
    }
  };

  const deleteSelectedRecords = async () => {
    if (selectedRecords.length === 0 || !activeShiftId) return;
    
    if (!confirm(`Delete ${selectedRecords.length} selected records?`)) return;
    
    try {
      setSaving(true);
      // This assumes your API supports bulk delete
      await api.post(`/api/shifts/${activeShiftId}/delete-records`, {
        type: activeLedgerType,
        recordIds: selectedRecords
      });
      
      toast({ title: "Success", description: `${selectedRecords.length} records deleted` });
      setSelectedRecords([]);
      setShowBulkActions(false);
      await refreshSingleShift(activeShiftId);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete records", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const shift = shifts.find(s => s._id === activeShiftId);
    const records = getFilteredRecords();
    
    if (!shift || records.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = [
      'Time', 
      activeLedgerType === 'fuel' || activeLedgerType === 'testing' ? 'Liters' : 'Amount',
      'Description',
      'Vehicle Number',
      'Bill Number',
      'Transaction ID',
      'Customer',
      'Category',
      'Date'
    ];

    const data = records.map((record: any) => [
      record.time || '',
      record.amount || record.liters || '',
      record.notes || record.description || '',
      record.vehicleNumber || '',
      record.billNumber || '',
      record.transactionId || '',
      record.customerName || '',
      record.category || '',
      record.date ? format(parseISO(record.date), 'yyyy-MM-dd') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shift.shiftId}_${activeLedgerType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "Exported", description: "Data exported to CSV" });
  };

  const printLedger = () => {
    const printContent = document.getElementById('ledger-table');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Ledger Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .total { font-weight: bold; color: green; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .stats { margin-top: 20px; padding: 10px; background: #f9f9f9; border-radius: 5px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // --- HELPER FUNCTIONS ---

  const hasActiveShift = (nozzlemanId: string) => {
    return shifts.some(shift => 
      shift.nozzleman._id === nozzlemanId && 
      (shift.status === "Active" || shift.status === "Pending Approval")
    );
  };

  // --- SHIFT CREATION FUNCTIONS ---

  const startNewShiftAutomatically = async (nozzleman: Nozzleman) => {
    try {
      setSaving(true);
      
      const now = new Date();
      const shiftId = `SH${Date.now().toString().slice(-6)}`;
      const assignedNozzles = nozzleman.assignedNozzles || [];
      const nozzleIds = Array.isArray(assignedNozzles) 
        ? assignedNozzles.map(n => n._id || n)
        : [];
      
      const pumpId = nozzleman.assignedPump?._id || 
                     (assignedNozzles[0] && nozzles.find(n => n._id === assignedNozzles[0])?.pump);

      if (!pumpId || nozzleIds.length === 0) {
        toast({
          title: "Cannot Start Shift",
          description: "Nozzleman has no assigned pump or nozzles",
          variant: "destructive",
        });
        return;
      }

      const shiftData = {
        shiftId: shiftId,
        nozzleman: nozzleman._id,
        pump: pumpId,
        nozzles: nozzleIds,
        startReading: 0,
        status: 'Active',
        startTime: now.toISOString(),
        notes: `Auto-started shift for ${nozzleman.name}`,
        isSimpleStart: true,
        
        cashCollected: 0,
        phonePeSales: 0,
        posSales: 0,
        otpSales: 0,
        creditSales: 0,
        fuelDispensed: 0,
        testingFuel: 0,
        expenses: 0,
        cashDeposit: 0,
        cashInHand: 0,
      };

      await api.post("/api/shifts/start-multi", shiftData);
      
      toast({
        title: "✅ Success",
        description: `New shift auto-started for ${nozzleman.name}`,
      });
      await fetchAllData();
      
    } catch (error: any) {
      console.error("Failed to auto-start shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start shift",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const startMultiNozzleShift = async (nozzleman: Nozzleman, nozzleIds: string[]) => {
    try {
      setSaving(true);
      setQuickStarting(nozzleman._id);
      
      const now = new Date();
      const shiftId = `SH${Date.now().toString().slice(-6)}`;
      const nozzleDetails = nozzles.filter(n => nozzleIds.includes(n._id));
      const pumpId = nozzleDetails[0]?.pump || nozzleman.assignedPump?._id;

      if (!pumpId) {
        toast({
          title: "Error",
          description: "No pump assigned",
          variant: "destructive",
        });
        return;
      }

      const shiftData = {
        shiftId: shiftId,
        nozzleman: nozzleman._id,
        pump: pumpId,
        nozzles: nozzleIds,
        startReading: 0,
        status: 'Active',
        startTime: now.toISOString(),
        notes: `Multi-nozzle shift started for ${nozzleman.name}`,
        cashCollected: 0,
        phonePeSales: 0,
        posSales: 0,
        otpSales: 0,
        creditSales: 0,
        fuelDispensed: 0,
        testingFuel: 0,
        expenses: 0,
        cashDeposit: 0,
        cashInHand: 0,
        isManualEntry: false
      };

      await api.post("/api/shifts/start-multi", shiftData);
      toast({
        title: "✅ Success",
        description: `Shift started with ${nozzleIds.length} nozzles`,
      });
      setSelectedNozzles([]);
      await fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start shift",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setQuickStarting(null);
    }
  };

  const startNewShift = async () => {
    try {
      setSaving(true);
      if (!startNewShiftDialog.nozzleman) return;
      const timeParts = newShiftForm.time.split(':');
      const shiftData = {
        nozzlemanId: newShiftForm.nozzlemanId,
        date: newShiftForm.date,
        startTime: `${timeParts[0]}:${timeParts[1] || '00'}`,
        notes: newShiftForm.notes,
        isSimpleStart: true,
        cashCollected: 0, phonePeSales: 0, posSales: 0, otpSales: 0, creditSales: 0,
        fuelDispensed: 0, testingFuel: 0, expenses: 0, cashDeposit: 0, cashInHand: 0
      };

      await api.post("/api/shifts/manual-entry", shiftData);
      toast({ title: "Success", description: "New shift started" });
      await fetchAllData();
      setStartNewShiftDialog({ open: false, nozzleman: null });
    } catch (error) {
      toast({ title: "Error", description: "Failed to start shift", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStart = async (nozzlemanId: string) => {
    if (quickStarting) return;
    setQuickStarting(nozzlemanId);
    try {
      const nozzleman = nozzlemen.find(n => n._id === nozzlemanId);
      if (nozzleman) await startNewShiftAutomatically(nozzleman);
    } catch (error) {
    } finally {
      setQuickStarting(null);
    }
  };

  const startAllInactiveNozzlemen = async () => {
    if (quickStartingMultiple) return;
    const inactiveNozzlemen = nozzlemen.filter(n => !hasActiveShift(n._id));
    
    if (inactiveNozzlemen.length === 0) {
      toast({ title: "No Inactive Nozzlemen", description: "All nozzlemen already have active shifts" });
      return;
    }
    
    if (!confirm(`Start shifts for ${inactiveNozzlemen.length} inactive nozzlemen?`)) return;
    
    setQuickStartingMultiple(true);
    let successCount = 0;
    
    try {
      for (const nozzleman of inactiveNozzlemen) {
        try {
          await startNewShiftAutomatically(nozzleman);
          successCount++;
        } catch (e) { console.error(e); }
      }
      toast({ title: "Bulk Start Complete", description: `Started ${successCount} shifts` });
    } finally {
      setQuickStartingMultiple(false);
    }
  };

  // --- EDIT SHIFT FUNCTIONS ---

  const startEditing = (shift: Shift) => {
    setIsEndingShift(false);
    setEditingShift(shift);
    setEditForm({
      shiftId: shift.shiftId,
      nozzlemanId: shift.nozzleman._id,
      pumpId: shift.pump._id,
      nozzleId: shift.nozzle?._id,
      nozzleReadings: shift.nozzleReadings?.map(nr => ({
        ...nr,
        openingReading: nr.openingReading || 0,
        closingReading: nr.closingReading || 0,
        testingFuel: (nr as any).testingFuel || 0 
      })) || [],
      startTime: format(parseISO(shift.startTime), 'HH:mm'),
      endTime: shift.endTime ? format(parseISO(shift.endTime), 'HH:mm') : "16:00",
      date: shift.startTime.split('T')[0],
      cashCollected: shift.cashCollected,
      phonePeSales: shift.phonePeSales,
      posSales: shift.posSales,
      otpSales: shift.otpSales,
      creditSales: shift.creditSales,
      fuelDispensed: shift.fuelDispensed, 
      testingFuel: shift.testingFuel,
      expenses: shift.expenses,
      cashDeposit: shift.cashDeposit,
      cashInHand: shift.cashInHand,
      status: shift.status,
      notes: shift.notes || "",
      auditNotes: shift.auditNotes || "",
    });
  };

  const cancelEditing = () => {
    setEditingShift(null);
    setEditForm(null);
  };

  const handleNozzleChange = (index: number, field: string, value: string | number) => {
    const updatedReadings = [...editForm.nozzleReadings];
    updatedReadings[index] = {
      ...updatedReadings[index],
      [field]: parseFloat(value as string) || 0
    };

    if (field === 'closingReading' || field === 'openingReading') {
        const open = field === 'openingReading' ? parseFloat(value as string) : updatedReadings[index].openingReading;
        const close = field === 'closingReading' ? parseFloat(value as string) : updatedReadings[index].closingReading;
        updatedReadings[index].fuelDispensed = Math.max(0, close - open);
    }

    const totalDispensed = updatedReadings.reduce((sum, r) => sum + (r.fuelDispensed || 0), 0);
    const totalTesting = updatedReadings.reduce((sum, r) => sum + (r.testingFuel || 0), 0);

    setEditForm({
      ...editForm,
      nozzleReadings: updatedReadings,
      fuelDispensed: totalDispensed,
      testingFuel: totalTesting
    });
  };

  const saveChanges = async () => {
    if (!editingShift || !editForm) return;

    try {
      setSaving(true);
      const formattedNozzleReadings = editForm.nozzleReadings.map((nr: any) => ({
        nozzleId: nr.nozzle._id || nr.nozzle,
        openingReading: nr.openingReading,
        closingReading: nr.closingReading,
        testingFuel: nr.testingFuel || 0,
        fuelType: nr.fuelType
      }));

      const payload = {
        shiftId: editForm.shiftId,
        nozzlemanId: editForm.nozzlemanId,
        pumpId: editForm.pumpId,
        nozzleReadings: formattedNozzleReadings,
        startTime: `${editForm.date}T${editForm.startTime}:00.000Z`,
        endTime: isEndingShift ? new Date() : (editForm.endTime ? `${editForm.date}T${editForm.endTime}:00.000Z` : null),
        cashCollected: editForm.cashCollected,
        phonePeSales: editForm.phonePeSales,
        posSales: editForm.posSales,
        otpSales: editForm.otpSales,
        creditSales: editForm.creditSales,
        expenses: editForm.expenses,
        cashDeposit: editForm.cashDeposit,
        cashInHand: editForm.cashInHand,
        fuelDispensed: editForm.fuelDispensed,
        testingFuel: editForm.testingFuel,
        status: isEndingShift ? "Pending Approval" : editForm.status,
        notes: editForm.notes,
        auditNotes: editForm.auditNotes,
        endShift: isEndingShift
      };

      if (isEndingShift) {
          await api.put(`/api/shifts/${editingShift._id}/nozzle-readings`, payload);
          toast({ title: "Shift Ended", description: "Shift closed and sent for approval." });
      } else {
          await api.put(`/api/shifts/${editingShift._id}`, payload);
          toast({ title: "Success", description: "Shift updated successfully" });
      }

      await fetchAllData();
      cancelEditing();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to save shift", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async (shiftId: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;
    try {
      await api.delete(`/api/shifts/${shiftId}`);
      toast({ title: "Success", description: "Shift deleted" });
      await fetchAllData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete shift", variant: "destructive" });
    }
  };

  // --- SUB-COMPONENTS ---

  const NozzlemanProfileCard = ({ nozzleman, isSelected }: { nozzleman: Nozzleman, isSelected: boolean }) => {
    const hasActive = hasActiveShift(nozzleman._id);
    const assignedNozzles = nozzleman.assignedNozzles || [];
    const nozzleDetails = nozzles.filter(n => assignedNozzles.some((an: any) => an._id === n._id || an === n._id));

    return (
      <Card className={`cursor-pointer transition-all h-full min-h-[160px] flex flex-col ${isSelected ? 'border-2 border-blue-500 shadow-md' : 'hover:shadow-sm hover:border-gray-300'}`}
        onClick={() => { setNozzlemanFilter(nozzleman._id); setSelectedNozzles([]); }}
      >
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <User className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm mb-0.5 text-gray-900 line-clamp-1">{nozzleman.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{nozzleman.employeeId}</p>
                </div>
                {hasActive && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0 h-5">Active</Badge>}
              </div>
              {nozzleDetails.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {nozzleDetails.map((nozzle) => (
                      <Badge key={nozzle._id} variant={selectedNozzles.includes(nozzle._id) ? "default" : "outline"}
                        className="text-xs cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedNozzles.includes(nozzle._id)) setSelectedNozzles(prev => prev.filter(id => id !== nozzle._id));
                          else setSelectedNozzles(prev => [...prev, nozzle._id]);
                        }}
                      >
                        {nozzle.number} ({nozzle.fuelType})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {isSelected && !hasActive && (
            <div className="mt-auto pt-3 border-t">
              {selectedNozzles.length > 0 ? (
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                  onClick={(e) => { e.stopPropagation(); startMultiNozzleShift(nozzleman, selectedNozzles); }}
                  disabled={saving}
                >
                  Start Shift ({selectedNozzles.length})
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="w-full h-8 text-xs"
                   onClick={(e) => { e.stopPropagation(); handleQuickStart(nozzleman._id); }}
                   disabled={saving}
                >
                  <Zap className="h-3 w-3 mr-1" /> Quick Start
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // --- POWERFUL LEDGER VIEW ---

  const LedgerView = () => {
    const shift = shifts.find(s => s._id === activeShiftId);
    if (!shift) return null;
    
    const records = getFilteredRecords();
    const total = getTotal(shift, activeLedgerType);
    const color = getThemeColor(activeLedgerType);
    const isLiterType = activeLedgerType === 'fuel' || activeLedgerType === 'testing';

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-right-10 duration-200">
        {/* LEDGER HEADER */}
        <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="gap-2 text-gray-600" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-5 w-5" /> Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold flex items-center gap-2 capitalize">
                {activeLedgerType === 'cashDeposit' ? 'Cash Handover' : activeLedgerType} Ledger
                <Badge className={`bg-${color}-100 text-${color}-800 border-${color}-200 hover:bg-${color}-100`}>
                  {shift.status}
                </Badge>
              </h2>
              <span className="text-xs text-gray-500">Shift {shift.shiftId} • {shift.nozzleman.name} • {format(parseISO(shift.startTime), 'dd MMM, hh:mm a')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-semibold">Count</div>
                <div className="text-xl font-bold">{records.length}</div>
              </div>
              <div className={`text-right px-4 py-1 bg-${color}-50 rounded-lg border border-${color}-100`}>
                <div className={`text-xs text-${color}-600 uppercase font-semibold`}>Net Total</div>
                <div className={`text-2xl font-bold text-${color}-700`}>
                  {isLiterType ? `${total.toLocaleString()} L` : `₹${total.toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LEDGER BODY */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: INPUT FORM & CALCULATOR */}
          <div className="w-[420px] border-r bg-white p-6 flex flex-col overflow-y-auto shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase text-gray-500 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Entry
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openQuickCalculator}
                className="gap-2"
              >
                <Calculator className="h-4 w-4" /> Quick Calc
              </Button>
            </div>

            {/* CALCULATOR PANEL */}
            {showCalculator && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <Label className="font-semibold">Quick Calculator</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => setShowCalculator(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input
                  ref={calculatorInputRef}
                  value={calculatorValue}
                  onChange={(e) => setCalculatorValue(e.target.value)}
                  className="mb-3 font-mono text-right text-lg h-10"
                  placeholder="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCalculatorInput('=');
                    }
                  }}
                />
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                    <Button
                      key={btn}
                      variant={btn === '=' ? "default" : "outline"}
                      className={`h-10 ${btn === '=' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      onClick={() => handleCalculatorInput(btn)}
                    >
                      {btn}
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => handleCalculatorInput('clear')}>
                    Clear
                  </Button>
                  <Button variant="default" onClick={() => handleCalculatorInput('transfer')}>
                    Transfer to Form
                  </Button>
                </div>
                
                {calculatorHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <Label className="text-xs text-gray-500">History</Label>
                    <div className="max-h-20 overflow-y-auto">
                      {calculatorHistory.slice(-3).map((entry, idx) => (
                        <div key={idx} className="text-xs font-mono text-gray-600 truncate">
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ENTRY FORM */}
            <div className="space-y-5 flex-1">
              {activeLedgerType === 'expenses' && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={ledgerForm.category} onValueChange={v => setLedgerForm({...ledgerForm, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {['Salary', 'Maintenance', 'Tea/Snacks', 'Electricity', 'Fuel', 'Stationary', 'Other'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeLedgerType === 'credit' && (
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={ledgerForm.customerId} onValueChange={v => {
                    const customer = customers.find(c => c._id === v);
                    setLedgerForm({
                      ...ledgerForm, 
                      customerId: v,
                      customerName: customer?.name || ""
                    });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c._id} value={c._id}>
                          <div className="flex justify-between w-full">
                            <span>{c.name}</span>
                            <span className="text-xs text-gray-500 ml-2">₹{c.balance}/₹{c.creditLimit}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ledgerForm.customerId && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                      Selected: {customers.find(c => c._id === ledgerForm.customerId)?.name}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className={`text-${color}-700 font-semibold`}>
                  {isLiterType ? 'Volume (Liters)' : 'Amount (₹)'}
                </Label>
                <div className="relative">
                  {!isLiterType && <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />}
                  {isLiterType && <Fuel className="absolute left-3 top-3 h-5 w-5 text-gray-400" />}
                  <Input 
                    ref={amountInputRef}
                    type="number" 
                    className="pl-10 h-12 text-lg font-bold"
                    placeholder="0.00"
                    value={isLiterType ? ledgerForm.liters : ledgerForm.amount}
                    onChange={e => setLedgerForm({
                      ...ledgerForm, 
                      [isLiterType ? 'liters' : 'amount']: e.target.value
                    })}
                    onKeyDown={(e) => { 
                      if(e.key === 'Enter') handleAddRecord();
                      if(e.key === 'F2') openQuickCalculator();
                    }}
                  />
                  <div className="absolute right-3 top-3">
                    <span className="text-xs text-gray-400">F2 = Calc</span>
                  </div>
                </div>
              </div>

              {activeLedgerType === 'cash' && (
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-2">
                    {['cash', 'card', 'upi'].map(method => (
                      <Button
                        key={method}
                        type="button"
                        variant={ledgerForm.paymentMethod === method ? "default" : "outline"}
                        className="flex-1 capitalize"
                        onClick={() => setLedgerForm({...ledgerForm, paymentMethod: method as any})}
                      >
                        {method}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {activeLedgerType === 'testing' && (
                <div className="space-y-2">
                  <Label>Tested By</Label>
                  <Input 
                    value={ledgerForm.testedBy}
                    onChange={e => setLedgerForm({...ledgerForm, testedBy: e.target.value})}
                    placeholder="Enter tester name"
                  />
                </div>
              )}

              {(activeLedgerType === 'cash' || activeLedgerType === 'credit' || activeLedgerType === 'fuel') && (
                <div className="space-y-2">
                  <Label>Vehicle Number (Optional)</Label>
                  <Input 
                    placeholder="MH-12-AB-1234" 
                    value={ledgerForm.vehicleNumber}
                    onChange={e => setLedgerForm({...ledgerForm, vehicleNumber: e.target.value})}
                  />
                </div>
              )}

              {(activeLedgerType === 'cash' || activeLedgerType === 'phonepe' || activeLedgerType === 'pos') && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Bill Number</Label>
                    <Input 
                      placeholder="Bill No." 
                      value={ledgerForm.billNumber}
                      onChange={e => setLedgerForm({...ledgerForm, billNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transaction ID</Label>
                    <Input 
                      placeholder="TXN ID" 
                      value={ledgerForm.transactionId}
                      onChange={e => setLedgerForm({...ledgerForm, transactionId: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Description / Note</Label>
                <Textarea 
                  placeholder="Type details here..." 
                  value={ledgerForm.note}
                  onChange={e => setLedgerForm({...ledgerForm, note: e.target.value})}
                  className="resize-none"
                  rows={3}
                  onKeyDown={(e) => { 
                    if(e.key === 'Enter' && e.ctrlKey) handleAddRecord();
                  }}
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Ctrl + Enter to save</span>
                  <span>F2 for calculator</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  className={`w-full h-12 text-md font-semibold bg-${color}-600 hover:bg-${color}-700 shadow-lg shadow-${color}-100`}
                  onClick={handleAddRecord}
                  disabled={saving}
                >
                  {saving ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                  {saving ? 'Saving...' : 'Add Entry'}
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: LEDGER TABLE & CONTROLS */}
          <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
            {/* FILTERS & CONTROLS */}
            <div className="p-4 bg-white border-b shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search records..."
                        className="pl-10"
                        value={ledgerFilter.search}
                        onChange={e => setLedgerFilter({...ledgerFilter, search: e.target.value})}
                      />
                    </div>
                    
                    <Select value={ledgerFilter.dateRange} onValueChange={(v: any) => setLedgerFilter({...ledgerFilter, dateRange: v})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={ledgerFilter.sortBy} onValueChange={(v: any) => setLedgerFilter({...ledgerFilter, sortBy: v})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">By Time</SelectItem>
                        <SelectItem value="amount">By Amount</SelectItem>
                        <SelectItem value="date">By Date</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setLedgerFilter({...ledgerFilter, sortOrder: ledgerFilter.sortOrder === 'asc' ? 'desc' : 'asc'})}
                    >
                      {ledgerFilter.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedRecords.length > 0 && (
                      <div className="flex items-center gap-2 mr-2">
                        <Badge variant="secondary">{selectedRecords.length} selected</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={deleteSelectedRecords}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                      <FileSpreadsheet className="h-4 w-4 mr-1" /> Export
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={printLedger}>
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </Button>
                  </div>
                </div>

                {/* QUICK FILTERS */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-500 whitespace-nowrap">Amount Range:</Label>
                    <Input
                      type="number"
                      placeholder="Min"
                      className="w-24"
                      value={ledgerFilter.minAmount}
                      onChange={e => setLedgerFilter({...ledgerFilter, minAmount: e.target.value})}
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-24"
                      value={ledgerFilter.maxAmount}
                      onChange={e => setLedgerFilter({...ledgerFilter, maxAmount: e.target.value})}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLedgerFilter({
                      search: "",
                      minAmount: "",
                      maxAmount: "",
                      dateRange: "today",
                      sortBy: "time",
                      sortOrder: "desc"
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* STATS BAR */}
            {/* <div className="p-3 bg-white border-b">
              <div className="grid grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Total</div>
                  <div className={`text-lg font-bold text-${color}-700`}>
                    {isLiterType ? `${ledgerStats.total.toLocaleString()}L` : `₹${ledgerStats.total.toLocaleString()}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Count</div>
                  <div className="text-lg font-bold text-gray-800">{ledgerStats.count}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Average</div>
                  <div className="text-lg font-bold text-blue-600">
                    {isLiterType ? `${ledgerStats.average.toFixed(2)}L` : `₹${ledgerStats.average.toFixed(2)}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Highest</div>
                  <div className="text-lg font-bold text-green-600">
                    {isLiterType ? `${ledgerStats.highest.toLocaleString()}L` : `₹${ledgerStats.highest.toLocaleString()}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Lowest</div>
                  <div className="text-lg font-bold text-red-600">
                    {isLiterType ? `${ledgerStats.lowest.toLocaleString()}L` : `₹${ledgerStats.lowest.toLocaleString()}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Hourly Rate</div>
                  <div className="text-lg font-bold text-purple-600">
                    {isLiterType ? `${ledgerStats.hourlyRate.toFixed(2)}L/hr` : `₹${ledgerStats.hourlyRate.toFixed(2)}/hr`}
                  </div>
                </div>
              </div>
            </div> */}

            {/* LEDGER TABLE */}
            <div className="flex-1 overflow-y-auto p-6" id="ledger-table">
              <Card className="shadow-none border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedRecords.length === records.length && records.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead className="w-[100px]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Time
                        </div>
                      </TableHead>
                      <TableHead>Details</TableHead>
                      {activeLedgerType === 'cash' && <TableHead className="w-24">Payment</TableHead>}
                      {activeLedgerType === 'expenses' && <TableHead className="w-24">Category</TableHead>}
                      {activeLedgerType === 'credit' && <TableHead className="w-32">Customer</TableHead>}
                      {activeLedgerType === 'fuel' && <TableHead className="w-24">Fuel Type</TableHead>}
                      <TableHead className="text-right w-32">Value</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.length > 0 ? (
                      records.map((record: any, idx: number) => (
                        <TableRow 
                          key={record._id || idx} 
                          className={`group hover:bg-blue-50/50 transition-colors ${selectedRecords.includes(record._id) ? 'bg-blue-50' : ''}`}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record._id)}
                              onChange={() => handleSelectRecord(record._id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-mono text-gray-500 text-xs py-4">
                            <div className="flex flex-col">
                              <span>{record.time}</span>
                              {record.date && (
                                <span className="text-[10px] text-gray-400">
                                  {format(parseISO(record.date), 'dd/MM')}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">
                              {record.notes || record.description || "Manual Entry"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                              {record.vehicleNumber && (
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200 flex items-center gap-1">
                                  <Truck className="h-2.5 w-2.5" /> {record.vehicleNumber}
                                </span>
                              )}
                              {record.billNumber && (
                                <span className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 border border-blue-200 flex items-center gap-1">
                                  <FileText className="h-2.5 w-2.5" /> {record.billNumber}
                                </span>
                              )}
                              {record.transactionId && (
                                <span className="bg-green-100 px-1.5 py-0.5 rounded text-green-700 border border-green-200 flex items-center gap-1">
                                  <Receipt className="h-2.5 w-2.5" /> {record.transactionId.slice(0, 8)}...
                                </span>
                              )}
                              {record.receiptNumber && (
                                <span className="bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-700 border border-yellow-200 flex items-center gap-1">
                                  <Receipt className="h-2.5 w-2.5" /> {record.receiptNumber}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          
                          {/* Type-specific columns */}
                          {activeLedgerType === 'cash' && (
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {record.paymentMethod || 'cash'}
                              </Badge>
                            </TableCell>
                          )}
                          
                          {activeLedgerType === 'expenses' && (
                            <TableCell>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {record.category}
                              </Badge>
                            </TableCell>
                          )}
                          
                          {activeLedgerType === 'credit' && (
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{record.customerName}</span>
                                {record.customerId && (
                                  <span className="text-[10px] text-gray-500 truncate">ID: {record.customerId.slice(-6)}</span>
                                )}
                              </div>
                            </TableCell>
                          )}
                          
                          {activeLedgerType === 'fuel' && (
                            <TableCell>
                              <Badge variant="outline" className={
                                record.fuelType === 'Petrol' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }>
                                {record.fuelType}
                              </Badge>
                            </TableCell>
                          )}
                          
                          <TableCell className="text-right py-4">
                            <div className="flex flex-col items-end">
                              <span className={`text-lg font-bold font-mono text-${color}-700`}>
                                {isLiterType ? `${record.liters}L` : `₹${record.amount}`}
                              </span>
                              {record.rate && (
                                <span className="text-xs text-gray-500">
                                  @ ₹{record.rate}/L
                                </span>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  // Edit functionality
                                  toast({
                                    title: "Edit Record",
                                    description: "Edit functionality coming soon"
                                  });
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                onClick={() => {
                                  if (confirm("Delete this record?")) {
                                    // Delete functionality
                                    toast({
                                      title: "Delete Record",
                                      description: "Delete functionality coming soon"
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={activeLedgerType === 'cash' ? 7 : activeLedgerType === 'credit' ? 7 : 6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className={`p-4 rounded-full bg-${color}-50 mb-3`}>
                              <Hash className={`h-8 w-8 text-${color}-200`} />
                            </div>
                            <p>No records found in this ledger yet.</p>
                            <p className="text-sm">Use the form on the left to add data.</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={openQuickCalculator}
                            >
                              <Calculator className="h-4 w-4 mr-2" /> Open Calculator
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
              
              {/* SUMMARY CARD */}
              {records.length > 0 && (
                <Card className="mt-6 border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-green-600" />
                          Ledger Summary
                        </h3>
                        <p className="text-sm text-gray-500">
                          {records.length} records • Last updated: {format(new Date(), 'hh:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-700">
                          {isLiterType ? `${total.toLocaleString()} L` : `₹${total.toLocaleString()}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total {activeLedgerType}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- DASHBOARD COMPONENTS ---

  const Level1FuelSales = ({ shift }: { shift: Shift }) => {
    // If shift has multiple nozzle readings, show them
    if (shift.nozzleReadings && shift.nozzleReadings.length > 1) {
      return (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            Multi-Nozzle Readings
            <Badge variant="outline" className="ml-2">
              {shift.nozzleReadings.length} Nozzles
            </Badge>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shift.nozzleReadings.map((reading: NozzleReading, index: number) => {
              const fuelDispensed = reading.closingReading 
                ? reading.closingReading - reading.openingReading
                : 0;
              
              // Get nozzle details
              const nozzleInfo = nozzles.find(n => n._id === reading.nozzle?._id);
              const nozzleNumber = reading.nozzleNumber || nozzleInfo?.number || `Nozzle ${index + 1}`;
              const fuelType = reading.fuelType || nozzleInfo?.fuelType || "Unknown";
              
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Fuel className={`h-4 w-4 ${
                          fuelType === 'Diesel' ? 'text-blue-600' : 
                          fuelType === 'Petrol' ? 'text-green-600' : 
                          'text-purple-600'
                        }`} />
                        {nozzleNumber} - {fuelType}
                      </span>
                      <Badge variant="outline">
                        Nozzle {index + 1}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Opening Reading</Label>
                        <div className="text-2xl font-bold text-gray-700">
                          {reading.openingReading.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Start of shift</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Closing Reading</Label>
                        <div className="text-2xl font-bold text-gray-700">
                          {reading.closingReading ? reading.closingReading.toLocaleString() : "Not Set"}
                        </div>
                        <div className="text-xs text-gray-500">End of shift</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Fuel Sales:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Opening:</span>
                          <span className="font-medium">{reading.openingReading.toLocaleString()} L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Closing:</span>
                          <span className="font-medium">
                            {reading.closingReading ? reading.closingReading.toLocaleString() + " L" : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2 border-t pt-2 mt-2">
                          <span className="text-gray-600">Fuel Dispensed:</span>
                          <span className="font-bold text-green-600">
                            {fuelDispensed.toLocaleString()} L
                          </span>
                        </div>
                        {reading.rate && reading.rate > 0 && (
                          <div className="flex justify-between col-span-2">
                            <span className="text-gray-600">Rate:</span>
                            <span className="font-medium">₹{reading.rate}/L</span>
                          </div>
                        )}
                        {reading.salesAmount && reading.salesAmount > 0 && (
                          <div className="flex justify-between col-span-2 border-t pt-2 mt-2">
                            <span className="text-gray-600">Calculated Sales:</span>
                            <span className="font-bold text-blue-600">
                              ₹{reading.salesAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Summary by Fuel Type */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fuel Summary by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Petrol', 'Diesel', 'CNG'].map((fuelType) => {
                  const typeReadings = shift.nozzleReadings.filter(r => r.fuelType === fuelType);
                  const totalDispensed = typeReadings.reduce((sum, reading) => {
                    const dispensed = reading.closingReading 
                      ? reading.closingReading - reading.openingReading
                      : 0;
                    return sum + dispensed;
                  }, 0);
                  
                  const totalSales = typeReadings.reduce((sum, reading) => {
                    return sum + (reading.salesAmount || 0);
                  }, 0);
                  
                  if (typeReadings.length === 0) return null;
                  
                  return (
                    <div key={fuelType} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {totalDispensed.toLocaleString()} L
                      </div>
                      <div className="text-sm text-gray-600">{fuelType}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        {typeReadings.length} nozzle(s)
                      </div>
                      {totalSales > 0 && (
                        <div className="text-sm font-medium text-blue-600">
                          ₹{totalSales.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                }).filter(Boolean)}
              </div>
              
              {/* Grand Total */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-blue-700">Grand Total</h4>
                    <p className="text-sm text-gray-600">
                      Across all {shift.nozzleReadings.length} nozzles
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700">
                      {shift.nozzleReadings.reduce((sum, reading) => {
                        const dispensed = reading.closingReading 
                          ? reading.closingReading - reading.openingReading
                          : 0;
                        return sum + dispensed;
                      }, 0).toLocaleString()} L
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Fuel Dispensed
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Fallback to original single nozzle display
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Fuel className="h-4 w-4 text-green-600" />
              Nozzle Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Opening Reading</Label>
                <div className="text-2xl font-bold text-gray-700">
                  {shift.startReading.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Start of shift</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Closing Reading</Label>
                <div className="text-2xl font-bold text-gray-700">
                  {shift.endReading.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">End of shift</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-4 w-4 text-blue-600" />
              Fuel Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Dispensed:</span>
                <span className="text-xl font-bold text-green-600">{shift.fuelDispensed.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Testing Fuel:</span>
                <span className="text-xl font-bold text-red-600">{shift.testingFuel.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-gray-800 font-semibold">Net Sales:</span>
                <span className="text-2xl font-bold text-blue-600">{(shift.fuelDispensed - shift.testingFuel).toLocaleString()} L</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const Level2PaymentMethods = ({ shift }: { shift: Shift }) => {
    const PaymentCard = ({ 
      title, 
      value, 
      type,
      color = "green",
      icon = DollarSign,
    }: any) => {
      const Icon = icon;
      const isLiters = type === 'fuel' || type === 'testing';
      
      const colorClasses: any = {
        green: "bg-green-50 border-green-200 hover:bg-green-100",
        blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
        purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
        indigo: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
        orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
        red: "bg-red-50 border-red-200 hover:bg-red-100",
        gray: "bg-gray-50 border-gray-200 hover:bg-gray-100",
        yellow: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
      };

      const textColors: any = {
        green: "text-green-700",
        blue: "text-blue-700",
        purple: "text-purple-700",
        indigo: "text-indigo-700",
        orange: "text-orange-700",
        red: "text-red-700",
        gray: "text-gray-700",
        yellow: "text-yellow-700"
      };

      return (
        <Card 
          className={`cursor-pointer transition-all ${colorClasses[color]} border h-full`}
          onClick={() => enterLedgerMode(shift._id, type)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${textColors[color]}`} />
                <Label className={`font-medium ${textColors[color]}`}>{title}</Label>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  enterLedgerMode(shift._id, type);
                }}
                title="View Ledger"
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
            <div className={`text-2xl font-bold ${textColors[color]}`}>
              {isLiters ? `${value.toLocaleString()}L` : `₹${value.toLocaleString()}`}
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Click to view detailed ledger
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Payment Methods
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PaymentCard title="Cash Sales" value={shift.cashCollected || 0} type="cash" color="green" icon={DollarSign} />
          <PaymentCard title="PhonePe" value={shift.phonePeSales || 0} type="phonepe" color="blue" icon={Smartphone} />
          <PaymentCard title="POS" value={shift.posSales || 0} type="pos" color="purple" icon={CreditCard} />
          <PaymentCard title="Credit Sales" value={shift.creditSales || 0} type="credit" color="indigo" icon={Circle} />
        </div>
      </div>
    );
  };

  const Level2ExpensesOther = ({ shift }: { shift: Shift }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card 
          className="cursor-pointer bg-orange-50 border-orange-200 hover:bg-orange-100 transition-all h-full"
          onClick={() => enterLedgerMode(shift._id, 'fuel')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-orange-600" />
                <Label className="font-medium text-orange-700">Fuel</Label>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); enterLedgerMode(shift._id, 'fuel'); }}>
                <List className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-2xl font-bold text-orange-600">{(shift.fuelDispensed || 0).toLocaleString()}L</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer bg-red-50 border-red-200 hover:bg-red-100 transition-all h-full"
          onClick={() => enterLedgerMode(shift._id, 'testing')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-red-600" />
                <Label className="font-medium text-red-700">Testing</Label>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); enterLedgerMode(shift._id, 'testing'); }}>
                <List className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-2xl font-bold text-red-600">{(shift.testingFuel || 0).toLocaleString()}L</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all h-full"
          onClick={() => enterLedgerMode(shift._id, 'expenses')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-gray-600" />
                <Label className="font-medium text-gray-700">Expenses</Label>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); enterLedgerMode(shift._id, 'expenses'); }}>
                <List className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-2xl font-bold text-gray-700">₹{(shift.expenses || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Syncs to Expense Page</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition-all h-full"
          onClick={() => enterLedgerMode(shift._id, 'cashDeposit')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-yellow-600" />
                <Label className="font-medium text-yellow-700">Cash Deposit</Label>
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              ₹{(shift.cashDeposit || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Syncs to Cash Handovers</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const Level3CashInHand = ({ shift }: { shift: Shift }) => {
    const netCash = (shift.cashCollected || 0) - (shift.expenses || 0) - (shift.cashDeposit || 0);
    
    return (
      <Card className="mb-6 border-2 border-pink-200">
        <CardHeader className="bg-pink-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-pink-600" />
            Cash in Hand
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">
                ₹{(shift.cashInHand || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Actual Cash in Hand</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700">Calculation:</div>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span className="font-medium">₹{(shift.cashCollected || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Expenses:</span>
                  <span className="font-medium">-₹{(shift.expenses || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Cash Deposit:</span>
                  <span className="font-medium">-₹{(shift.cashDeposit || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="font-medium">Expected:</span>
                  <span className="font-bold text-green-600">₹{netCash.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold ${netCash === (shift.cashInHand || 0) ? 'text-green-600' : 'text-red-600'}`}>
                {netCash === (shift.cashInHand || 0) ? '✓ Balanced' : '⚠ Discrepancy'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Difference: ₹{Math.abs(netCash - (shift.cashInHand || 0)).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- RENDER ---

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <RefreshCw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Loading Accounting Data...</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {viewMode === 'ledger' ? (
        <LedgerView />
      ) : (
        <div className="p-6 space-y-6">
          <PageHeader title="Sales Accounting" description="Manage shift ledgers and audits." />
          
          {/* BULK & QUICK START SECTION */}
          <div className="space-y-6">
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full"><Zap className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <h3 className="font-semibold">Bulk Operations</h3>
                    <p className="text-sm text-gray-500">Start single-nozzle shifts for inactive nozzlemen</p>
                  </div>
                </div>
                <Button onClick={startAllInactiveNozzlemen} disabled={quickStartingMultiple || saving} className="bg-purple-600 hover:bg-purple-700">
                  {quickStartingMultiple ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Start All Inactive
                </Button>
              </CardContent>
            </Card>

            {/* Nozzleman Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <Card className={`cursor-pointer transition-all h-full min-h-[140px] flex flex-col ${nozzlemanFilter === "all" ? 'border-2 border-blue-500 shadow-md' : 'hover:shadow-sm'}`}
                onClick={() => setNozzlemanFilter("all")}
              >
                <CardContent className="p-4 flex flex-col flex-1 items-center justify-center text-center">
                  <Target className={`h-8 w-8 mb-2 ${nozzlemanFilter === "all" ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-base">All Shifts</h3>
                </CardContent>
              </Card>
              {nozzlemen.map((nozzleman) => (
                <NozzlemanProfileCard key={nozzleman._id} nozzleman={nozzleman} isSelected={nozzlemanFilter === nozzleman._id} />
              ))}
            </div>
          </div>

          {/* FILTERS */}
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search shifts..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchAllData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </CardContent>
          </Card>

          {/* NEW SHIFT DIALOG */}
          <Dialog open={startNewShiftDialog.open} onOpenChange={(open) => setStartNewShiftDialog({...startNewShiftDialog, open})}>
            <DialogContent>
              <DialogHeader><DialogTitle>Start New Shift</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Select onValueChange={(val) => {
                  const n = nozzlemen.find(nz => nz._id === val);
                  setStartNewShiftDialog({ open: true, nozzleman: n || null });
                  setNewShiftForm({ ...newShiftForm, nozzlemanId: val });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select Nozzleman" /></SelectTrigger>
                  <SelectContent>
                    {nozzlemen.map(n => <SelectItem key={n._id} value={n._id}>{n.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={startNewShift} disabled={saving}>Start Shift</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* SHIFT LIST */}
          <div className="grid grid-cols-1 gap-6">
            {filteredShifts.map((shift) => {
              const isEditing = editingShift?._id === shift._id;
              
              if (isEditing) {
                // --- EDIT MODE ---
                return (
                  <Card key={shift._id} className="border-2 border-blue-500 shadow-lg">
                    <CardHeader className="bg-gray-50 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>Editing Shift: {shift.shiftId}</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={cancelEditing}>Cancel</Button>
                          <Button 
                            size="sm" 
                            onClick={saveChanges} 
                            disabled={saving} 
                            className={isEndingShift ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                          >
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : isEndingShift ? <Power className="h-4 w-4 mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
                            {saving ? "Saving..." : isEndingShift ? "End Shift & Close" : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Date</Label>
                          <Input 
                            type="date" 
                            value={editForm.date} 
                            onChange={e => setEditForm({...editForm, date: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Start Time</Label>
                          <Input 
                            type="time" 
                            value={editForm.startTime} 
                            onChange={e => setEditForm({...editForm, startTime: e.target.value})} 
                          />
                        </div>
                      </div>

                      {/* Nozzle Readings Input */}
                      <div className="bg-gray-50 p-4 rounded border">
                        <Label className="font-bold mb-2 block">Nozzle Readings</Label>
                        {editForm.nozzleReadings && editForm.nozzleReadings.length > 0 ? (
                          editForm.nozzleReadings.map((reading: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded border mb-2 grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">Start Reading</Label>
                                <Input 
                                  type="number" 
                                  value={reading.openingReading} 
                                  onChange={e => handleNozzleChange(idx, 'openingReading', e.target.value)} 
                                />
                              </div>
                              <div>
                                <Label className="text-xs">End Reading</Label>
                                <Input 
                                  type="number" 
                                  value={reading.closingReading} 
                                  onChange={e => handleNozzleChange(idx, 'closingReading', e.target.value)} 
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Testing Fuel (L)</Label>
                                <Input 
                                  type="number" 
                                  value={reading.testingFuel} 
                                  onChange={e => handleNozzleChange(idx, 'testingFuel', e.target.value)} 
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-red-500 p-2 text-center border border-red-200 bg-red-50 rounded">
                            No nozzle data found in this shift.
                          </div>
                        )}
                      </div>

                      {/* Sales Data */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Cash Sales (₹)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={editForm.cashCollected} 
                            onChange={e => setEditForm({...editForm, cashCollected: parseFloat(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>PhonePe (₹)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={editForm.phonePeSales} 
                            onChange={e => setEditForm({...editForm, phonePeSales: parseFloat(e.target.value) || 0})} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>POS Sales (₹)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={editForm.posSales} 
                            onChange={e => setEditForm({...editForm, posSales: parseFloat(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Credit Sales (₹)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={editForm.creditSales} 
                            onChange={e => setEditForm({...editForm, creditSales: parseFloat(e.target.value) || 0})} 
                          />
                        </div>
                      </div>

                      {/* Financials */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Expenses (₹)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={editForm.expenses} 
                            onChange={e => setEditForm({...editForm, expenses: parseFloat(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Cash Deposit (₹)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={editForm.cashDeposit} 
                            onChange={e => setEditForm({...editForm, cashDeposit: parseFloat(e.target.value) || 0})} 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label>Cash in Hand (₹)</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={editForm.cashInHand} 
                          onChange={e => setEditForm({...editForm, cashInHand: parseFloat(e.target.value) || 0})} 
                        />
                      </div>

                      {/* End Shift Toggle */}
                      {editForm.status === 'Active' && (
                        <div className="bg-blue-50 p-4 rounded border border-blue-200 flex items-center justify-between">
                          <div>
                            <Label className="font-bold text-blue-900">End This Shift?</Label>
                            <p className="text-xs text-blue-700">Deducts inventory & locks shift.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="endShift" 
                              className="w-5 h-5" 
                              checked={isEndingShift} 
                              onChange={e => setIsEndingShift(e.target.checked)} 
                            />
                            <Label htmlFor="endShift">Yes, End Shift</Label>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea 
                          value={editForm.notes} 
                          onChange={e => setEditForm({...editForm, notes: e.target.value})}
                          placeholder="Add notes..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Audit Notes</Label>
                        <Textarea 
                          value={editForm.auditNotes} 
                          onChange={e => setEditForm({...editForm, auditNotes: e.target.value})}
                          placeholder="Audit notes..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // --- VIEW MODE ---
              const netCash = (shift.cashCollected || 0) - (shift.expenses || 0) - (shift.cashDeposit || 0);
              return (
                <Card key={shift._id} className="hover:border-blue-300 transition-colors">
                  <CardHeader className="bg-gray-50/50 pb-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          {shift.shiftId}
                          <Badge variant={shift.status === 'Active' ? 'default' : 'secondary'} className={shift.status === 'Active' ? 'bg-green-600' : ''}>
                            {shift.status}
                          </Badge>
                        </CardTitle>
                        <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {shift.nozzleman.name}</span>
                          <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {shift.pump.name}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(parseISO(shift.startTime), 'dd MMM, hh:mm a')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Net Cash in Hand</div>
                          <div className={`text-2xl font-bold ${netCash < 0 ? 'text-red-600' : 'text-green-700'}`}>
                            ₹{netCash.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEditing(shift)}>
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteShift(shift._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* LEVEL 1: Fuel & Meter Readings */}
                    <Level1FuelSales shift={shift} />

                    {/* LEVEL 2: Payment Methods */}
                    <Level2PaymentMethods shift={shift} />

                    {/* LEVEL 2b: Expenses & Other */}
                    <Level2ExpensesOther shift={shift} />

                    {/* LEVEL 3: Cash in Hand */}
                    <Level3CashInHand shift={shift} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};