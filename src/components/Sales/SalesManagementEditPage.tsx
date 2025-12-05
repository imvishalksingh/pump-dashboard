// SalesManagementEditPage.tsx - COMPLETE UPDATED VERSION WITH QUICK START SHIFT
import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { 
  Edit, 
  Save, 
  X, 
  RefreshCw, 
  Search,
  Filter,
  DollarSign,
  Fuel,
  TestTube,
  Wallet,
  CreditCard,
  Smartphone,
  Receipt,
  User,
  Building,
  Gauge,
  Calendar,
  Clock,
  Trash2,
  Download,
  Upload,
  Plus,
  Calculator,
  Eye,
  FileText,
  PieChart,
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  Target,
  Key,
  ArrowRight,
  Droplets,
  Zap,
  BarChart3,
  TrendingUp,
  Circle,
  Square,
  Triangle,
  List,
  FileEdit,
  MoreVertical,
  PlayCircle,
  Power,
  History,
  FilePlus,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface Shift {
  _id: string;
  shiftId: string;
  nozzleman: {
    _id: string;
    name: string;
    employeeId: string;
  };
  pump: {
    _id: string;
    name: string;
    location: string;
    fuelType: string;
  };
  nozzle: {
    _id: string;
    number: string;
    fuelType: string;
  };
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
  meterReadingHSD: {
    opening: number;
    closing: number;
  };
  meterReadingPetrol: {
    opening: number;
    closing: number;
  };
  status: "Active" | "Completed" | "Pending Approval" | "Approved" | "Rejected";
  notes?: string;
  auditNotes?: string;
  isManualEntry: boolean;
  isSimpleStart?: boolean; // NEW FIELD
  createdAt: string;
  updatedAt: string;
  cashSalesRecords?: CashRecord[];
  phonePeRecords?: DigitalRecord[];
  posRecords?: DigitalRecord[];
  fuelRecords?: FuelRecord[];
  testingRecords?: TestingRecord[];
  expenseRecords?: ExpenseRecord[];
}

interface CashRecord {
  _id?: string;
  amount: number;
  time: string;
  notes?: string;
  billNumber?: string;
  vehicleNumber?: string;
  paymentMethod?: "cash" | "card" | "upi";
}

interface DigitalRecord {
  _id?: string;
  amount: number;
  time: string;
  transactionId: string;
  customerName?: string;
  notes?: string;
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
}

interface TestingRecord {
  _id?: string;
  liters: number;
  time: string;
  testedBy: string;
  notes?: string;
}

interface ExpenseRecord {
  _id?: string;
  amount: number;
  time: string;
  category: string;
  description: string;
  receiptNumber?: string;
}

interface Nozzleman {
  _id: string;
  name: string;
  employeeId: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

interface Pump {
  _id: string;
  name: string;
  location: string;
  fuelType: string;
}

interface Nozzle {
  _id: string;
  number: string;
  fuelType: string;
  pump: string;
  currentReading: number;
}

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  balance: number;
  creditLimit: number;
}

export const SalesManagementEditPage = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [nozzlemen, setNozzlemen] = useState<Nozzleman[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [nozzlemanFilter, setNozzlemanFilter] = useState("all");
  const { toast } = useToast();

  // Quick start loading states
  const [quickStarting, setQuickStarting] = useState<string | null>(null);
  const [quickStartingMultiple, setQuickStartingMultiple] = useState(false);

  // Calculator states
  const [activeCalculator, setActiveCalculator] = useState<{
    type: 'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit';
    shift: Shift;
    field: string;
  } | null>(null);
  
  // Start New Shift Dialog State
  const [startNewShiftDialog, setStartNewShiftDialog] = useState({
    open: false,
    nozzleman: null as Nozzleman | null
  });

  // New Shift Form State
  const [newShiftForm, setNewShiftForm] = useState({
    nozzlemanId: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: ""
  });

  const [calculatorValue, setCalculatorValue] = useState("");
  const [calculatorRecords, setCalculatorRecords] = useState<any[]>([]);
  const [calculatorTotal, setCalculatorTotal] = useState(0);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>("Maintenance");
  const expenseCategories = ['Maintenance', 'Salary', 'Utilities', 'Supplies', 'Other'];
  const calculatorInputRef = useRef<HTMLDivElement>(null);
  
  // Records dialog states
  const [recordsDialog, setRecordsDialog] = useState<{
    open: boolean;
    type: 'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit';
    shift: Shift | null;
  }>({
    open: false,
    type: 'cash',
    shift: null
  });

  // Add record dialog state
  const [addRecordDialog, setAddRecordDialog] = useState<{
    open: boolean;
    type: 'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit';
    shift: Shift | null;
  }>({
    open: false,
    type: 'cash',
    shift: null
  });

  // New record form
  const [newRecord, setNewRecord] = useState<any>({
    amount: 0,
    liters: 0,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: '',
    transactionId: '',
    customerName: '',
    vehicleNumber: '',
    fuelType: 'Petrol',
    nozzleNumber: '',
    category: '',
    description: '',
    billNumber: '',
    paymentMethod: 'cash',
    testedBy: '',
    receiptNumber: ''
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

// Update startNewShiftAutomatically function
const startNewShiftAutomatically = async (nozzleman: Nozzleman) => {
  try {
    setSaving(true);
    
    // Format date and time properly
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    
    console.log("📅 Formatted date:", date);
    console.log("⏰ Formatted time:", time);

    const shiftData = {
      nozzlemanId: nozzleman._id,
      date: date,
      startTime: time,
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
      cashInHand: 0
    };

    console.log("🤖 Auto-starting shift data:", shiftData);

    const response = await api.post("/api/shifts/manual-entry", shiftData);
    
    if (response.data.success === true || response.status === 201) {
      toast({
        title: "✅ Success",
        description: `New shift auto-started for ${nozzleman.name}`,
      });
      await fetchAllData();
    } else {
      throw new Error(response.data.message || "Failed to start shift");
    }
    
  } catch (error: any) {
    console.error("❌ Failed to auto-start shift:", error);
    console.error("❌ Error details:", error.response?.data);
    
    let errorMessage = "Failed to start shift";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw error;
  } finally {
    setSaving(false);
  }
};

// Update startNewShift function (for "Start with Options")
const startNewShift = async () => {
  try {
    setSaving(true);
    
    if (!startNewShiftDialog.nozzleman) {
      toast({
        title: "Error",
        description: "Nozzleman not selected",
        variant: "destructive",
      });
      return;
    }

    // Format time to HH:MM
    const timeParts = newShiftForm.time.split(':');
    const formattedTime = `${timeParts[0]}:${timeParts[1] || '00'}`;

    const shiftData = {
      nozzlemanId: newShiftForm.nozzlemanId,
      date: newShiftForm.date,
      startTime: formattedTime,
      notes: newShiftForm.notes || `Shift started by admin for ${startNewShiftDialog.nozzleman.name}`,
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
      cashInHand: 0
    };

    console.log("📤 Starting shift with data:", shiftData);

    const response = await api.post("/api/shifts/manual-entry", shiftData);
    
    if (response.data.success === true || response.status === 201) {
      toast({
        title: "Success",
        description: `New shift started for ${startNewShiftDialog.nozzleman.name}`,
      });

      await fetchAllData();
      setStartNewShiftDialog({ open: false, nozzleman: null });
    } else {
      throw new Error(response.data.message || "Failed to start shift");
    }
    
  } catch (error: any) {
    console.error("❌ Failed to start new shift:", error);
    console.error("❌ Error response:", error.response?.data);
    
    let errorMessage = "Failed to start new shift";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};

  // NEW FUNCTION: Quick Start with Confirmation
  const startNewShiftWithConfirmation = async (nozzleman: Nozzleman) => {
    if (!confirm(`Start new shift for ${nozzleman.name} now?\n\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)) {
      return;
    }
    
    await startNewShiftAutomatically(nozzleman);
  };

  // NEW FUNCTION: Handle Quick Start Click
  const handleQuickStart = async (nozzlemanId: string) => {
    if (quickStarting) return;
    
    setQuickStarting(nozzlemanId);
    try {
      const nozzleman = nozzlemen.find(n => n._id === nozzlemanId);
      if (nozzleman) {
        await startNewShiftAutomatically(nozzleman);
      }
    } catch (error) {
      // Error already handled in function
    } finally {
      setQuickStarting(null);
    }
  };

  // NEW FUNCTION: Start All Inactive Nozzlemen
  const startAllInactiveNozzlemen = async () => {
    if (quickStartingMultiple) return;
    
    const inactiveNozzlemen = nozzlemen
      .filter(n => !hasActiveShift(n._id))
      .map(n => ({ id: n._id, name: n.name }));
    
    if (inactiveNozzlemen.length === 0) {
      toast({
        title: "No Inactive Nozzlemen",
        description: "All nozzlemen already have active shifts",
        variant: "default",
      });
      return;
    }
    
    if (!confirm(`Start shifts for ${inactiveNozzlemen.length} inactive nozzlemen?\n\n• ${inactiveNozzlemen.map(n => n.name).join('\n• ')}`)) {
      return;
    }
    
    setQuickStartingMultiple(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const nozzleman of inactiveNozzlemen) {
        try {
          const nozzlemanObj = nozzlemen.find(n => n._id === nozzleman.id);
          if (nozzlemanObj) {
            await startNewShiftAutomatically(nozzlemanObj);
            successCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Failed to start shift for ${nozzleman.name}:`, error);
        }
      }
      
      toast({
        title: "Bulk Start Complete",
        description: `Started ${successCount} shifts, ${errorCount} failed`,
        variant: successCount > 0 ? "default" : "destructive",
      });
      
    } finally {
      setQuickStartingMultiple(false);
    }
  };

  // Keyboard shortcuts for calculator
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeCalculator) return;
    
    const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                           document.activeElement?.tagName === 'TEXTAREA';
    if (isInputFocused) return;
    
    switch(e.key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        e.preventDefault();
        handleCalculatorInput(e.key);
        break;
      case '.':
      case ',':
        e.preventDefault();
        handleCalculatorInput('.');
        break;
      case 'Enter':
        e.preventDefault();
        handleCalculatorInput('add');
        break;
      case 'Backspace':
        e.preventDefault();
        handleCalculatorInput('backspace');
        break;
      case 'Escape':
        e.preventDefault();
        handleCalculatorInput('clear');
        break;
      case '+':
        if (e.shiftKey) {
          e.preventDefault();
          handleCalculatorInput('add');
        }
        break;
      case 's':
      case 'S':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleCalculatorInput('save');
        }
        break;
    }
  }, [activeCalculator, calculatorValue, calculatorRecords, calculatorTotal]);

  useEffect(() => {
    if (activeCalculator) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        calculatorInputRef.current?.focus();
      }, 100);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCalculator, handleKeyDown]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterShifts();
  }, [shifts, searchTerm, statusFilter, dateFilter, nozzlemanFilter]);

  // Update the fetchAllData function
const fetchAllData = async () => {
  try {
    setLoading(true);
    
    const [shiftsRes, nozzlemenRes, pumpsRes, nozzlesRes, customersRes] = await Promise.all([
      api.get("/api/shifts?limit=500"),
      api.get("/api/nozzlemen"),
      api.get("/api/pumps"),
      api.get("/api/nozzles"),
      api.get("/api/customers")
    ]);
    
    console.log("📊 Nozzlemen response:", nozzlemenRes.data);
    console.log("📊 Shifts response:", shiftsRes.data);
    
    // FIX: Handle different response formats
    let nozzlemenData = [];
    if (Array.isArray(nozzlemenRes.data)) {
      nozzlemenData = nozzlemenRes.data;
    } else if (nozzlemenRes.data && Array.isArray(nozzlemenRes.data.data)) {
      nozzlemenData = nozzlemenRes.data.data;
    } else if (nozzlemenRes.data && nozzlemenRes.data.nozzlemen) {
      nozzlemenData = nozzlemenRes.data.nozzlemen;
    }
    
    let shiftsData = [];
    if (Array.isArray(shiftsRes.data)) {
      shiftsData = shiftsRes.data;
    } else if (shiftsRes.data && Array.isArray(shiftsRes.data.shifts)) {
      shiftsData = shiftsRes.data.shifts;
    } else if (shiftsRes.data && shiftsRes.data.data) {
      shiftsData = Array.isArray(shiftsRes.data.data) ? shiftsRes.data.data : [shiftsRes.data.data];
    }
    
    console.log("✅ Parsed nozzlemen:", nozzlemenData.length);
    console.log("✅ Parsed shifts:", shiftsData.length);
    
    const shiftsWithRecords = shiftsData.map((shift: any) => ({
      ...shift,
      cashSalesRecords: shift.cashSalesRecords || [],
      phonePeRecords: shift.phonePeRecords || [],
      posRecords: shift.posRecords || [],
      fuelRecords: shift.fuelRecords || [],
      testingRecords: shift.testingRecords || [],
      expenseRecords: shift.expenseRecords || [],
      creditRecords: shift.creditRecords || []
    }));
    
    setShifts(shiftsWithRecords);
    setNozzlemen(nozzlemenData);
    
    // Handle other data similarly
    setPumps(Array.isArray(pumpsRes.data) ? pumpsRes.data : pumpsRes.data?.data || []);
    setNozzles(Array.isArray(nozzlesRes.data) ? nozzlesRes.data : nozzlesRes.data?.data || []);
    setCustomers(Array.isArray(customersRes.data) ? customersRes.data : customersRes.data?.data || []);
    
  } catch (error: any) {
    console.error("❌ Failed to fetch data:", error);
    console.error("❌ Error response:", error.response?.data);
    
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch data",
      variant: "destructive",
    });
    
    // Set empty arrays on error
    setShifts([]);
    setNozzlemen([]);
    setPumps([]);
    setNozzles([]);
    setCustomers([]);
  } finally {
    setLoading(false);
  }
};

  const filterShifts = () => {
    let filtered = shifts;

    if (searchTerm) {
      filtered = filtered.filter(shift =>
        shift.shiftId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.nozzleman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.nozzleman.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.pump.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(shift => shift.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(shift => 
        shift.startTime.startsWith(dateFilter)
      );
    }

    if (nozzlemanFilter !== "all") {
      filtered = filtered.filter(shift => shift.nozzleman._id === nozzlemanFilter);
    }

    setFilteredShifts(filtered);
  };

  const getRecordsForType = (shift: Shift | null, type: string) => {
    if (!shift) return [];
    
    switch (type) {
      case 'cash': return shift.cashSalesRecords || [];
      case 'phonepe': return shift.phonePeRecords || [];
      case 'pos': return shift.posRecords || [];
      case 'fuel': return shift.fuelRecords || [];
      case 'testing': return shift.testingRecords || [];
      case 'expenses': return shift.expenseRecords || [];
      case 'credit': return shift.creditRecords || [];
      default: return [];
    }
  };

  const getFilteredNozzles = (pumpId: string) => {
    if (!pumpId) return [];
    return nozzles.filter(nozzle => nozzle.pump === pumpId);
  };

  const calculateTotalSales = (shift: Shift) => {
    return shift.cashCollected + shift.phonePeSales + shift.posSales + shift.otpSales + shift.creditSales;
  };

  const calculateNetFuel = (shift: Shift) => {
    return shift.fuelDispensed - shift.testingFuel;
  };

  const calculateHSDSales = (shift: Shift) => {
    if (shift.pump.fuelType === 'Diesel' || shift.pump.fuelType === 'HSD') {
      return shift.fuelDispensed - shift.testingFuel;
    }
    return 0;
  };

  const calculatePetrolSales = (shift: Shift) => {
    if (shift.pump.fuelType === 'Petrol') {
      return shift.fuelDispensed - shift.testingFuel;
    }
    return 0;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Active": "bg-blue-100 text-blue-800 border-blue-200",
      "Pending Approval": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Approved": "bg-green-100 text-green-800 border-green-200",
      "Rejected": "bg-red-100 text-red-800 border-red-200",
      "Completed": "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  const getNozzlemanStats = (nozzlemanId: string) => {
    const nozzlemanShifts = shifts.filter(shift => shift.nozzleman._id === nozzlemanId);
    
    return {
      totalShifts: nozzlemanShifts.length,
      totalSales: nozzlemanShifts.reduce((sum, shift) => sum + calculateTotalSales(shift), 0),
      netFuel: nozzlemanShifts.reduce((sum, shift) => sum + calculateNetFuel(shift), 0),
      totalCashSales: nozzlemanShifts.reduce((sum, shift) => sum + shift.cashCollected, 0),
      totalPhonePe: nozzlemanShifts.reduce((sum, shift) => sum + shift.phonePeSales, 0),
      totalPOS: nozzlemanShifts.reduce((sum, shift) => sum + shift.posSales, 0),
      totalCredit: nozzlemanShifts.reduce((sum, shift) => sum + shift.creditSales, 0),
      totalOtp: nozzlemanShifts.reduce((sum, shift) => sum + shift.otpSales, 0),
      totalTestingFuel: nozzlemanShifts.reduce((sum, shift) => sum + shift.testingFuel, 0),
      totalExpenses: nozzlemanShifts.reduce((sum, shift) => sum + shift.expenses, 0),
      totalCashDeposit: nozzlemanShifts.reduce((sum, shift) => sum + shift.cashDeposit, 0),
      totalCashInHand: nozzlemanShifts.reduce((sum, shift) => sum + shift.cashInHand, 0)
    };
  };

  const hasActiveShift = (nozzlemanId: string) => {
    return shifts.some(shift => 
      shift.nozzleman._id === nozzlemanId && 
      (shift.status === "Active" || shift.status === "Pending Approval")
    );
  };

  const getLastShift = (nozzlemanId: string) => {
    const nozzlemanShifts = shifts.filter(shift => shift.nozzleman._id === nozzlemanId);
    if (nozzlemanShifts.length === 0) return null;
    
    nozzlemanShifts.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    return nozzlemanShifts[0];
  };

  const openStartNewShiftDialog = (nozzleman: Nozzleman) => {
    setStartNewShiftDialog({
      open: true,
      nozzleman
    });
    
    setNewShiftForm({
      nozzlemanId: nozzleman._id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: `Shift started by admin for ${nozzleman.name}`
    });
  };

  // Calculator Functions
  const openCalculator = (
    type: 'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit', 
    shift: Shift, 
    field: string
  ) => {
    setActiveCalculator({ type, shift, field });
    setCalculatorValue("");
    
    const records = getRecordsForType(shift, type);
    if (records && records.length > 0) {
      setCalculatorRecords(records);
      const total = records.reduce((sum, record) => 
        sum + (record.amount || record.liters || 0), 0
      );
      setCalculatorTotal(total);
    } else {
      setCalculatorRecords([]);
      setCalculatorTotal(shift[field as keyof Shift] as number || 0);
    }
  };

  const handleCalculatorInput = (value: string) => {
    if (value === 'clear') {
      setCalculatorValue("");
    } else if (value === 'backspace') {
      setCalculatorValue(prev => prev.slice(0, -1));
    } else if (value === 'add') {
      if (!calculatorValue || parseFloat(calculatorValue) <= 0) return;
      
      const isLiters = activeCalculator?.type === 'fuel' || activeCalculator?.type === 'testing';
      const newRecord = {
        id: Date.now(),
        [isLiters ? 'liters' : 'amount']: parseFloat(calculatorValue),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        ...(activeCalculator?.type === 'expenses' ? { category: selectedExpenseCategory } : {})
      };
      
      setCalculatorRecords(prev => [...prev, newRecord]);
      setCalculatorTotal(prev => prev + parseFloat(calculatorValue));
      setCalculatorValue("");
      setTimeout(() => calculatorInputRef.current?.focus(), 10);
    } else if (value === 'save') {
      saveCalculatorRecords();
    } else {
      if (value === '.' && calculatorValue.includes('.')) return;
      if (calculatorValue === '0' && value !== '.') {
        setCalculatorValue(value);
      } else {
        setCalculatorValue(prev => prev + value);
      }
    }
  };

  const saveCalculatorRecords = async () => {
    if (!activeCalculator) return;
    
    try {
      setSaving(true);
      
      if (activeCalculator.type === 'expenses') {
         if (calculatorRecords.length === 0) return;

         const syncPromises = calculatorRecords.map(record => {
           return api.post('/api/expenses/sync', {
             shiftId: activeCalculator.shift._id,
             amount: record.amount,
             category: selectedExpenseCategory,
             description: `Shift expense: ${record.time}`,
             date: new Date().toISOString(),
             nozzlemanId: activeCalculator.shift.nozzleman._id,
             shiftReference: activeCalculator.shift.shiftId
           });
         });

         await Promise.all(syncPromises);
         toast({ 
           title: "Success", 
           description: `${calculatorRecords.length} expense(s) synced successfully to Expense System` 
         });

      } else {
        const apiRecords = calculatorRecords.map(record => {
          const { id, ...rest } = record;
          return rest;
        });
        
        await api.put(
          `/api/shifts/${activeCalculator.shift._id}/records/bulk`,
          {
            type: activeCalculator.type,
            records: apiRecords,
            total: calculatorTotal
          }
        );
        toast({ 
          title: "Success", 
          description: `${activeCalculator.type.toUpperCase()} records saved to shift` 
        });
      }
      
      await fetchAllData();
      setActiveCalculator(null);
      setSelectedExpenseCategory("Maintenance");
      
    } catch (error: any) {
      console.error("❌ Failed to save records:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save records",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeCalculatorRecord = (index: number) => {
    const removedValue = calculatorRecords[index].amount || calculatorRecords[index].liters || 0;
    setCalculatorRecords(prev => prev.filter((_, i) => i !== index));
    setCalculatorTotal(prev => prev - removedValue);
  };

  // Records Dialog Functions
  const openRecordsDialog = (type: 'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit', shift: Shift) => {
    setRecordsDialog({
      open: true,
      type,
      shift
    });
  };

  const openAddRecordDialog = (type: 'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit', shift: Shift | null) => {
    if (!shift) {
      toast({
        title: "Error",
        description: "No shift selected",
        variant: "destructive",
      });
      return;
    }
    
    setAddRecordDialog({
      open: true,
      type,
      shift
    });
    
    setSelectedCustomerId("");
    
    const defaults: any = {
      amount: 0,
      liters: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: '',
      transactionId: '',
      customerName: '',
      vehicleNumber: '',
      fuelType: 'Petrol',
      nozzleNumber: '',
      category: '',
      description: '',
      billNumber: '',
      paymentMethod: 'cash',
      testedBy: '',
      receiptNumber: ''
    };
    
    setNewRecord(defaults);
  };

  const saveNewRecord = async () => {
    if (!addRecordDialog.shift) return;

    try {
      setSaving(true);

      if (addRecordDialog.type === 'credit') {
        if (!selectedCustomerId || newRecord.amount <= 0) {
           toast({ 
             title: "Error", 
             description: "Please select a customer and enter valid amount", 
             variant: "destructive"
           });
           setSaving(false);
           return;
        }

        const selectedCustomer = customers.find(c => c._id === selectedCustomerId);
        
        const customerBalance = selectedCustomer?.balance || selectedCustomer?.currentBalance || 0;
        const newBalance = customerBalance + Number(newRecord.amount);
        if (newBalance > (selectedCustomer?.creditLimit || 0)) {
          toast({
            title: "Credit Limit Exceeded",
            description: `Customer ${selectedCustomer?.name} would exceed credit limit. Current: ${selectedCustomer?.balance}, Limit: ${selectedCustomer?.creditLimit}`,
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        const response = await api.post('/api/customers/sync-sale', {
          shiftId: addRecordDialog.shift._id,
          customerId: selectedCustomerId,
          amount: newRecord.amount,
          date: new Date().toISOString(),
          vehicleNumber: newRecord.vehicleNumber,
          notes: newRecord.notes || `Credit sale from shift ${addRecordDialog.shift.shiftId}`
        });
        
        toast({ 
          title: "✅ Success", 
          description: `Credit sale of ₹${newRecord.amount} synced to ${selectedCustomer?.name}'s ledger` 
        });

      } else if (addRecordDialog.type === 'expenses') {
        await api.post('/api/expenses/sync', {
          shiftId: addRecordDialog.shift._id,
          amount: newRecord.amount,
          category: newRecord.category || 'Other',
          description: newRecord.notes || `Expense from shift`,
          date: new Date().toISOString(),
          nozzlemanId: addRecordDialog.shift.nozzleman._id,
          shiftReference: addRecordDialog.shift.shiftId
        });
        
        toast({ 
          title: "Success", 
          description: "Expense synced successfully to Expense System" 
        });
      }

      await fetchAllData();
      setAddRecordDialog({ open: false, type: 'cash', shift: null });
      setSelectedCustomerId("");
      
    } catch (error: any) {
      console.error("❌ Failed to add record:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to sync record",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Edit Shift Functions
  const startEditing = (shift: Shift) => {
    setEditingShift(shift);
    setEditForm({
      shiftId: shift.shiftId,
      nozzlemanId: shift.nozzleman._id,
      pumpId: shift.pump._id,
      nozzleId: shift.nozzle._id,
      
      startTime: format(parseISO(shift.startTime), 'HH:mm'),
      endTime: shift.endTime ? format(parseISO(shift.endTime), 'HH:mm') : "16:00",
      date: shift.startTime.split('T')[0],
      
      cashCollected: shift.cashCollected,
      phonePeSales: shift.phonePeSales,
      posSales: shift.posSales,
      otpSales: shift.otpSales,
      creditSales: shift.creditSales,
      
      startReading: shift.startReading,
      endReading: shift.endReading,
      fuelDispensed: shift.fuelDispensed,
      testingFuel: shift.testingFuel,
      
      meterReadingHSD: { 
        opening: shift.meterReadingHSD?.opening || 0, 
        closing: shift.meterReadingHSD?.closing || 0 
      },
      meterReadingPetrol: { 
        opening: shift.meterReadingPetrol?.opening || 0, 
        closing: shift.meterReadingPetrol?.closing || 0 
      },
      
      expenses: shift.expenses,
      cashDeposit: shift.cashDeposit,
      cashInHand: shift.cashInHand,
      
      status: shift.status,
      notes: shift.notes || "",
      auditNotes: shift.auditNotes || "",
      isManualEntry: shift.isManualEntry
    });
  };

  const cancelEditing = () => {
    setEditingShift(null);
    setEditForm(null);
  };

  const saveChanges = async () => {
    if (!editingShift || !editForm) return;

    try {
      setSaving(true);
      
      const updateData = {
        shiftId: editForm.shiftId,
        nozzlemanId: editForm.nozzlemanId,
        pumpId: editForm.pumpId,
        nozzleId: editForm.nozzleId,
        
        startTime: `${editForm.date}T${editForm.startTime}:00.000Z`,
        endTime: `${editForm.date}T${editForm.endTime}:00.000Z`,
        
        cashCollected: editForm.cashCollected,
        phonePeSales: editForm.phonePeSales,
        posSales: editForm.posSales,
        otpSales: editForm.otpSales,
        creditSales: editForm.creditSales,
        
        startReading: editForm.startReading,
        endReading: editForm.endReading,
        fuelDispensed: editForm.fuelDispensed,
        testingFuel: editForm.testingFuel,
        
        meterReadingHSD: editForm.meterReadingHSD,
        meterReadingPetrol: editForm.meterReadingPetrol,
        
        expenses: editForm.expenses,
        cashDeposit: editForm.cashDeposit,
        cashInHand: editForm.cashInHand,
        
        status: editForm.status,
        notes: editForm.notes,
        auditNotes: editForm.auditNotes,
        isManualEntry: editForm.isManualEntry
      };

      await api.put(`/api/shifts/${editingShift._id}`, updateData);
      
      toast({
        title: "Success",
        description: "Shift data updated successfully",
      });

      await fetchAllData();
      cancelEditing();
      
    } catch (error: any) {
      console.error("❌ Failed to update shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || error.response?.data?.message || "Failed to update shift",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async (shiftId: string) => {
    if (!confirm("Are you sure you want to delete this shift? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/api/shifts/${shiftId}`);
      
      toast({
        title: "Success",
        description: "Shift deleted successfully",
      });

      await fetchAllData();
      
    } catch (error: any) {
      console.error("❌ Failed to delete shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete shift",
        variant: "destructive",
      });
    }
  };

const NozzlemanProfileCard = ({ nozzleman, isSelected }: { nozzleman: Nozzleman, isSelected: boolean }) => {
  const stats = getNozzlemanStats(nozzleman._id);
  const hasActive = hasActiveShift(nozzleman._id);
  const lastShift = getLastShift(nozzleman._id);
  
  return (
    <Card 
      className={`cursor-pointer transition-all h-full min-h-[140px] flex flex-col ${isSelected ? 'border-2 border-blue-500 shadow-md' : 'hover:shadow-sm hover:border-gray-300'}`}
      onClick={() => setNozzlemanFilter(nozzleman._id)}
    >
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <User className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm mb-0.5 text-gray-900 line-clamp-1">
                  {nozzleman.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {nozzleman.employeeId}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {hasActive && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0 h-5 flex items-center">
                    <Power className="h-2.5 w-2.5 mr-1" />
                    Active
                  </Badge>
                )}
                {isSelected && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0 h-5 flex items-center">
                    Selected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <p className="text-sm font-bold text-green-600 leading-tight">
              ₹{stats.totalSales.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
              Total Sales
            </p>
          </div>
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <p className="text-sm font-bold text-blue-600 leading-tight">
              {stats.netFuel.toLocaleString()}L
            </p>
            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
              Net Fuel
            </p>
          </div>
        </div>

        {/* Last Shift Info */}
        {lastShift && (
          <div className="text-xs text-gray-500 mb-3 truncate">
            Last: {format(parseISO(lastShift.startTime), 'MMM dd')} • {lastShift.status}
          </div>
        )}

        {/* Quick Start Buttons - Only show if selected and not active */}
        {isSelected && !hasActive && (
          <div className="mt-auto pt-3 border-t">
            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickStart(nozzleman._id);
                }}
                disabled={quickStarting === nozzleman._id || saving}
              >
                {quickStarting === nozzleman._id ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Quick Start
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  openStartNewShiftDialog(nozzleman);
                }}
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                With Options
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Click "Quick Start" for instant shift
            </p>
          </div>
        )}
        
        {/* Show message if selected but has active shift */}
        {isSelected && hasActive && (
          <div className="mt-auto pt-3 border-t">
            <div className="text-center">
              <Badge variant="outline" className="w-full justify-center bg-green-50 text-green-700 border-green-200 text-xs">
                <Power className="h-3 w-3 mr-1" />
                Shift Already Active
              </Badge>
              <p className="text-[10px] text-gray-400 mt-1.5">
                View shift details below
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

  const Level1FuelSales = ({ shift }: { shift: Shift }) => {
    const isHSD = shift.pump.fuelType === 'Diesel' || shift.pump.fuelType === 'HSD';
    const isPetrol = shift.pump.fuelType === 'Petrol';
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-4 w-4 text-blue-600" />
              Meter Reading - HSD (Diesel)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Opening Balance</Label>
                <div className="text-2xl font-bold text-gray-700">
                  {shift.meterReadingHSD?.opening?.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500">Previous day closing</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Closing Balance</Label>
                <div className="text-2xl font-bold text-gray-700">
                  {shift.meterReadingHSD?.closing?.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500">Today's closing</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">HSD Sales:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross:</span>
                  <span className="font-medium">{(isHSD ? shift.fuelDispensed : 0).toLocaleString()} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Testing:</span>
                  <span className="font-medium text-red-600">{(isHSD ? shift.testingFuel : 0).toLocaleString()} L</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-600">Net Sales:</span>
                  <span className="font-medium text-green-600">
                    {isHSD ? calculateHSDSales(shift).toLocaleString() : "0"} L
                  </span>
                </div>
                <div className="flex justify-between col-span-2 mt-2 pt-2 border-t">
                  <span className="text-gray-600">Next day opening:</span>
                  <span className="font-medium">
                    {shift.meterReadingHSD?.closing?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Fuel className="h-4 w-4 text-green-600" />
              Meter Reading - Petrol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Opening Balance</Label>
                <div className="text-2xl font-bold text-gray-700">
                  {shift.meterReadingPetrol?.opening?.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500">Previous day closing</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Closing Balance</Label>
                <div className="text-2xl font-bold text-gray-700">
                  {shift.meterReadingPetrol?.closing?.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500">Today's closing</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">Petrol Sales:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross:</span>
                  <span className="font-medium">{(isPetrol ? shift.fuelDispensed : 0).toLocaleString()} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Testing:</span>
                  <span className="font-medium text-red-600">{(isPetrol ? shift.testingFuel : 0).toLocaleString()} L</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-600">Net Sales:</span>
                  <span className="font-medium text-green-600">
                    {isPetrol ? calculatePetrolSales(shift).toLocaleString() : "0"} L
                  </span>
                </div>
                <div className="flex justify-between col-span-2 mt-2 pt-2 border-t">
                  <span className="text-gray-600">Next day opening:</span>
                  <span className="font-medium">
                    {shift.meterReadingPetrol?.closing?.toLocaleString() || "0"}
                  </span>
                </div>
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
      showCalculator = true,
      showRecords = true
    }: {
      title: string;
      value: number;
      type: 'cash' | 'phonepe' | 'pos' | 'fuel' | 'testing' | 'expenses' | 'credit';
      color?: string;
      icon?: any;
      showCalculator?: boolean;
      showRecords?: boolean;
    }) => {
      const Icon = icon;
      const isLiters = type === 'fuel' || type === 'testing';
      
      const colorClasses: Record<string, string> = {
        green: "bg-green-50 border-green-200 hover:bg-green-100",
        blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
        purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
        orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
        red: "bg-red-50 border-red-200 hover:bg-red-100",
        gray: "bg-gray-50 border-gray-200 hover:bg-gray-100",
        indigo: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
      };

      const textColors: Record<string, string> = {
        green: "text-green-700",
        blue: "text-blue-700",
        purple: "text-purple-700",
        orange: "text-orange-700",
        red: "text-red-700",
        gray: "text-gray-700",
        indigo: "text-indigo-700"
      };

      return (
        <Card 
          className={`cursor-pointer transition-all ${colorClasses[color]} border`}
          onClick={() => {
            if (showCalculator) {
              if (type === 'credit') {
                openAddRecordDialog('credit', shift);
              } else {
                openCalculator(type, shift, 
                  type === 'cash' ? 'cashCollected' : 
                  type === 'phonepe' ? 'phonePeSales' : 
                  type === 'pos' ? 'posSales' :
                  type === 'fuel' ? 'fuelDispensed' :
                  type === 'testing' ? 'testingFuel' : 'expenses');
              }
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${textColors[color]}`} />
                <Label className={`font-medium ${textColors[color]}`}>{title}</Label>
              </div>
              {showRecords && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRecordsDialog(type, shift);
                    }}
                    title="View Records"
                  >
                    <List className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className={`text-2xl font-bold ${textColors[color]}`}>
              {isLiters ? `${value.toLocaleString()}L` : `₹${value.toLocaleString()}`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {type === 'cash' ? 'Direct cash payments' :
               type === 'phonepe' ? 'Digital payments' :
               type === 'pos' ? 'Card payments' :
               type === 'fuel' ? 'Total fuel dispensed' :
               type === 'testing' ? 'Fuel used for testing' :
               type === 'expenses' ? 'Daily expenses' :
               type === 'credit' ? 'Credit accounts - Click to add sale' : ''}
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
          <PaymentCard
            title="Cash Sales"
            value={shift.cashCollected}
            type="cash"
            color="green"
            icon={DollarSign}
          />
          
          <PaymentCard
            title="PhonePe"
            value={shift.phonePeSales}
            type="phonepe"
            color="blue"
            icon={Smartphone}
          />
          
          <PaymentCard
            title="POS"
            value={shift.posSales}
            type="pos"
            color="purple"
            icon={CreditCard}
          />
          
          <PaymentCard
            title="Credit Sales"
            value={shift.creditSales}
            type="credit"
            color="indigo"
            icon={Circle}
            showCalculator={true}
            showRecords={false}
          />
        </div>
      </div>
    );
  };

  const Level2ExpensesOther = ({ shift }: { shift: Shift }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card 
          className="cursor-pointer bg-orange-50 border-orange-200 hover:bg-orange-100 transition-all"
          onClick={() => openCalculator('fuel', shift, 'fuelDispensed')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-orange-600" />
                <Label className="font-medium text-orange-700">Fuel</Label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRecordsDialog('fuel', shift);
                  }}
                  title="View Records"
                >
                  <List className="h-3 w-3" />
                </Button>
                
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {shift.fuelDispensed.toLocaleString()}L
            </div>
            <div className="text-xs text-gray-500 mt-1">Total fuel dispensed</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer bg-red-50 border-red-200 hover:bg-red-100 transition-all"
          onClick={() => openCalculator('testing', shift, 'testingFuel')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-red-600" />
                <Label className="font-medium text-red-700">Testing</Label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRecordsDialog('testing', shift);
                  }}
                  title="View Records"
                >
                  <List className="h-3 w-3" />
                </Button>
                
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {shift.testingFuel.toLocaleString()}L
            </div>
            <div className="text-xs text-gray-500 mt-1">Fuel used for testing</div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all"
          onClick={() => openCalculator('expenses', shift, 'expenses')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-gray-600" />
                <Label className="font-medium text-gray-700">Expenses</Label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRecordsDialog('expenses', shift);
                  }}
                  title="View Records"
                >
                  <List className="h-3 w-3" />
                </Button>
              
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              ₹{shift.expenses.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Daily expenses</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-yellow-600" />
                <Label className="font-medium text-yellow-700">Cash Deposit</Label>
              </div>
              <div className="text-xs text-gray-500">No calculator</div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              ₹{shift.cashDeposit.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Deposited to bank</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const Level3CashInHand = ({ shift }: { shift: Shift }) => {
    const netCash = shift.cashCollected - shift.expenses - shift.cashDeposit;
    
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
                ₹{shift.cashInHand.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Actual Cash in Hand</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700">Calculation:</div>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span className="font-medium">₹{shift.cashCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Expenses:</span>
                  <span className="font-medium">-₹{shift.expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Cash Deposit:</span>
                  <span className="font-medium">-₹{shift.cashDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="font-medium">Expected:</span>
                  <span className="font-bold text-green-600">₹{netCash.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold ${netCash === shift.cashInHand ? 'text-green-600' : 'text-red-600'}`}>
                {netCash === shift.cashInHand ? '✓ Balanced' : '⚠ Discrepancy'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Difference: ₹{Math.abs(netCash - shift.cashInHand).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <PageHeader
          title="Edit Sales Data"
          description="Comprehensive shift data management with calculator features"
        />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 mr-2" />
          <span>Loading shifts data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Edit Sales Data"
        description="Comprehensive shift data management with calculator features"
      />

      {/* NEW: Bulk Start Button */}
      <Card className="mb-6 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Bulk Shift Operations</h3>
                <p className="text-sm text-gray-500">
                  Start shifts for multiple nozzlemen at once
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={startAllInactiveNozzlemen}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={quickStartingMultiple || saving}
              >
                {quickStartingMultiple ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Starting All...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start All Inactive Nozzlemen
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

{/* Nozzlemen Profile Selector */}
<div className="mb-6">
  <div className="flex items-center gap-2 mb-3">
    <Users className="h-5 w-5 text-muted-foreground" />
    <h3 className="font-medium">Select Nozzleman</h3>
    <Badge variant="outline" className="ml-2">
      {Array.isArray(nozzlemen) ? nozzlemen.length : 0} nozzlemen
    </Badge>
    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
      {Array.isArray(nozzlemen) ? nozzlemen.filter(n => !hasActiveShift(n._id)).length : 0} inactive
    </Badge>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {/* All Nozzlemen Card */}
    <Card 
      className={`cursor-pointer transition-all h-full min-h-[140px] flex flex-col ${nozzlemanFilter === "all" ? 'border-2 border-blue-500 shadow-md' : 'hover:shadow-sm'}`}
      onClick={() => setNozzlemanFilter("all")}
    >
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${nozzlemanFilter === "all" ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Target className={`h-5 w-5 ${nozzlemanFilter === "all" ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">All Nozzlemen</h3>
            <p className="text-sm text-muted-foreground">View all shifts</p>
          </div>
        </div>
        {nozzlemanFilter === "all" && (
          <div className="mt-auto">
            <Badge variant="outline" className="w-full justify-center bg-blue-50 text-blue-700 border-blue-200">
              Currently Viewing All
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Nozzleman Cards */}
    {Array.isArray(nozzlemen) && nozzlemen.map((nozzleman) => (
      <NozzlemanProfileCard 
        key={nozzleman._id} 
        nozzleman={nozzleman} 
        isSelected={nozzlemanFilter === nozzleman._id}
      />
    ))}
  </div>
</div>


      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Shift ID, Name, Pump..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={fetchAllData} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {(dateFilter || statusFilter !== 'all' || searchTerm || nozzlemanFilter !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter("");
                    setNozzlemanFilter("all");
                  }} 
                  variant="outline" 
                  size="icon"
                  title="Clear all filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start New Shift Dialog */}
      <Dialog open={startNewShiftDialog.open} onOpenChange={(open) => setStartNewShiftDialog({...startNewShiftDialog, open})}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-green-600" />
              Start New Shift
            </DialogTitle>
            <DialogDescription>
              Start a new shift for {startNewShiftDialog.nozzleman?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nozzleman</Label>
              <div className="p-2 bg-gray-100 rounded-md">
                {startNewShiftDialog.nozzleman?.name} ({startNewShiftDialog.nozzleman?.employeeId})
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-shift-date">Date</Label>
                <Input
                  id="new-shift-date"
                  type="date"
                  value={newShiftForm.date}
                  onChange={(e) => setNewShiftForm({...newShiftForm, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-shift-time">Start Time</Label>
                <Input
                  id="new-shift-time"
                  type="time"
                  value={newShiftForm.time}
                  onChange={(e) => setNewShiftForm({...newShiftForm, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-shift-notes">Notes (Optional)</Label>
              <Textarea
                id="new-shift-notes"
                value={newShiftForm.notes}
                onChange={(e) => setNewShiftForm({...newShiftForm, notes: e.target.value})}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartNewShiftDialog({ open: false, nozzleman: null })}>
              Cancel
            </Button>
            <Button onClick={startNewShift} disabled={saving}>
              {saving ? "Starting..." : "Start Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calculator Dialog */}
      <Dialog open={!!activeCalculator} onOpenChange={() => setActiveCalculator(null)}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              <span>{activeCalculator?.type.toUpperCase()} Calculator</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {activeCalculator?.type === 'expenses' && (
              <div className="space-y-1">
                <Label>Expense Category</Label>
                <Select value={selectedExpenseCategory} onValueChange={setSelectedExpenseCategory}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div 
              ref={calculatorInputRef}
              tabIndex={0}
              className="bg-gray-900 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => calculatorInputRef.current?.focus()}
            >
              <div className="text-right">
                <div className="text-3xl font-bold mb-2 min-h-[40px]">
                  {calculatorValue || "0"}
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Type: {activeCalculator?.type}</span>
                  <span>
                    Total: {activeCalculator?.type === 'fuel' || activeCalculator?.type === 'testing' ? 
                      `${calculatorTotal.toLocaleString()}L` : `₹${calculatorTotal.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[7, 8, 9, '⌫', 4, 5, 6, 'C', 1, 2, 3, '.', 0, '00', 'Enter'].map((num) => (
                <Button
                  key={num}
                  variant={num === 'Enter' ? "default" : "outline"}
                  className={`h-12 text-lg font-mono ${num === 'Enter' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => {
                    if (num === '⌫') handleCalculatorInput('backspace');
                    else if (num === 'C') handleCalculatorInput('clear');
                    else if (num === 'Enter') handleCalculatorInput('add');
                    else handleCalculatorInput(num.toString());
                  }}
                >
                  {num}
                </Button>
              ))}
            </div>

            {calculatorRecords.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Added Items ({calculatorRecords.length})</Label>
                  <span className="text-sm font-medium">
                    Total: {activeCalculator?.type === 'fuel' || activeCalculator?.type === 'testing' ? 
                      `${calculatorTotal.toLocaleString()}L` : `₹${calculatorTotal.toLocaleString()}`}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {calculatorRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{record.time}</span>
                        <span className="font-medium">
                          {activeCalculator?.type === 'fuel' || activeCalculator?.type === 'testing' ? 
                            `${record.liters}L` : `₹${record.amount}`}
                          {record.category && ` (${record.category})`}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => removeCalculatorRecord(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="default"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg"
              onClick={() => handleCalculatorInput('save')}
              disabled={saving || (activeCalculator?.type === 'expenses' && !selectedExpenseCategory)}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {activeCalculator?.type === 'expenses' ? 'Sync to Expense System' : 'Save & Close'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Single Record Dialog */}
      <Dialog open={addRecordDialog.open} onOpenChange={(open) => setAddRecordDialog({...addRecordDialog, open})}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {addRecordDialog.type.toUpperCase()} Record</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {addRecordDialog.type === 'credit' && (
              <div className="space-y-2">
                <Label>Select Customer *</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} (₹{(customer.balance || 0).toLocaleString()}/₹{(customer.creditLimit || 0).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomerId && (
                  <div className="text-xs text-gray-500">
                    Selected: {customers.find(c => c._id === selectedCustomerId)?.name}
                  </div>
                )}
              </div>
            )}

            {addRecordDialog.type === 'expenses' && (
              <div className="space-y-2">
                <Label>Expense Category *</Label>
                <Select 
                  value={newRecord.category} 
                  onValueChange={(value) => setNewRecord({...newRecord, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label>Amount (₹) *</Label>
                <Input 
                  type="number" 
                  value={newRecord.amount || ''} 
                  onChange={e => setNewRecord({...newRecord, amount: parseFloat(e.target.value) || 0})}
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label>Time</Label>
                <Input 
                  type="time" 
                  value={newRecord.time} 
                  onChange={e => setNewRecord({...newRecord, time: e.target.value})}
                />
              </div>
            </div>

            {addRecordDialog.type === 'credit' && (
              <div className="space-y-2">
                <Label>Vehicle Number (Optional)</Label>
                <Input 
                  value={newRecord.vehicleNumber} 
                  onChange={e => setNewRecord({...newRecord, vehicleNumber: e.target.value})}
                  placeholder="MH12AB1234"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input 
                value={newRecord.notes} 
                onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                placeholder="Add description or reference..."
              />
            </div>

            <Button 
              className="w-full" 
              onClick={saveNewRecord}
              disabled={saving || 
                !newRecord.amount || 
                newRecord.amount <= 0 ||
                (addRecordDialog.type === 'credit' && !selectedCustomerId) ||
                (addRecordDialog.type === 'expenses' && !newRecord.category)
              }
            >
              {saving ? "Syncing..." : `Sync to ${addRecordDialog.type === 'credit' ? 'Customer Ledger' : 'Expense System'}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Records View Dialog */}
      <Dialog open={recordsDialog.open} onOpenChange={(open) => setRecordsDialog({...recordsDialog, open})}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {recordsDialog.type.toUpperCase()} Records
            </DialogTitle>
            <DialogDescription>
              View all {recordsDialog.type} records for this shift
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {recordsDialog.shift ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Shift: {recordsDialog.shift.shiftId}</h3>
                    <p className="text-sm text-gray-500">
                      Total: {recordsDialog.type === 'fuel' || recordsDialog.type === 'testing' ? 
                        `${(getRecordsForType(recordsDialog.shift, recordsDialog.type).reduce((sum, r) => sum + (r.liters || 0), 0) || 0).toLocaleString()}L` : 
                        `₹${(getRecordsForType(recordsDialog.shift, recordsDialog.type).reduce((sum, r) => sum + (r.amount || 0), 0) || 0).toLocaleString()}`}
                    </p>
                  </div>
                  
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      {recordsDialog.type === 'cash' && (
                        <>
                          <TableHead>Time</TableHead>
                          <TableHead>Amount (₹)</TableHead>
                          <TableHead>Bill No.</TableHead>
                          <TableHead>Vehicle No.</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Notes</TableHead>
                        </>
                      )}
                      {recordsDialog.type === 'phonepe' && (
                        <>
                          <TableHead>Time</TableHead>
                          <TableHead>Amount (₹)</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Notes</TableHead>
                        </>
                      )}
                      {recordsDialog.type === 'fuel' && (
                        <>
                          <TableHead>Time</TableHead>
                          <TableHead>Liters</TableHead>
                          <TableHead>Amount (₹)</TableHead>
                          <TableHead>Vehicle No.</TableHead>
                          <TableHead>Fuel Type</TableHead>
                          <TableHead>Notes</TableHead>
                        </>
                      )}
                      {recordsDialog.type === 'testing' && (
                        <>
                          <TableHead>Time</TableHead>
                          <TableHead>Liters</TableHead>
                          <TableHead>Tested By</TableHead>
                          <TableHead>Notes</TableHead>
                        </>
                      )}
                      {recordsDialog.type === 'expenses' && (
                        <>
                          <TableHead>Time</TableHead>
                          <TableHead>Amount (₹)</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Receipt No.</TableHead>
                          <TableHead>Notes</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getRecordsForType(recordsDialog.shift, recordsDialog.type).length > 0 ? (
                      getRecordsForType(recordsDialog.shift, recordsDialog.type).map((record: any, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.time || '-'}</TableCell>
                          <TableCell>
                            {recordsDialog.type === 'fuel' || recordsDialog.type === 'testing' ? 
                              `${record.liters || 0}L` : `₹${record.amount || 0}`
                            }
                          </TableCell>
                          {recordsDialog.type === 'cash' && (
                            <>
                              <TableCell>{record.billNumber || '-'}</TableCell>
                              <TableCell>{record.vehicleNumber || '-'}</TableCell>
                              <TableCell>{record.paymentMethod || 'cash'}</TableCell>
                              <TableCell>{record.notes || '-'}</TableCell>
                            </>
                          )}
                          {recordsDialog.type === 'phonepe' && (
                            <>
                              <TableCell>{record.transactionId || '-'}</TableCell>
                              <TableCell>{record.customerName || '-'}</TableCell>
                              <TableCell>{record.notes || '-'}</TableCell>
                            </>
                          )}
                          {recordsDialog.type === 'fuel' && (
                            <>
                              <TableCell>{record.vehicleNumber || '-'}</TableCell>
                              <TableCell>{record.fuelType || '-'}</TableCell>
                              <TableCell>{record.notes || '-'}</TableCell>
                            </>
                          )}
                          {recordsDialog.type === 'testing' && (
                            <>
                              <TableCell>{record.testedBy || '-'}</TableCell>
                              <TableCell>{record.notes || '-'}</TableCell>
                            </>
                          )}
                          {recordsDialog.type === 'expenses' && (
                            <>
                              <TableCell>{record.category || '-'}</TableCell>
                              <TableCell>{record.description || '-'}</TableCell>
                              <TableCell>{record.receiptNumber || '-'}</TableCell>
                              <TableCell>{record.notes || '-'}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell 
                          colSpan={recordsDialog.type === 'cash' || recordsDialog.type === 'phonepe' ? 6 : 
                                  recordsDialog.type === 'fuel' ? 6 : 
                                  recordsDialog.type === 'testing' ? 4 : 6} 
                          className="text-center py-8 text-gray-500"
                        >
                          No records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No shift selected
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shifts List */}
      <div className="space-y-6">
        {filteredShifts.length > 0 ? (
          filteredShifts.map((shift) => (
            <Card key={shift._id} className={editingShift?._id === shift._id ? "border-2 border-blue-500 shadow-lg" : "hover:shadow-md transition-shadow"}>
              <CardContent className="p-6">
                {editingShift?._id === shift._id ? (
                  
                   <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Editing: {shift.shiftId}</h3>
                      <p className="text-sm text-muted-foreground">
                        {shift.nozzleman.name} ({shift.nozzleman.employeeId}) • {shift.pump.name} - {shift.nozzle.number}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={cancelEditing} variant="outline" disabled={saving}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={saveChanges} disabled={saving}>
                        {saving ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info & Sales */}
                    <div className="space-y-4">
                      {/* Basic Information */}
                      <div className="space-y-3">
                        <Label className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Basic Information
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-shiftId">Shift ID</Label>
                            <Input
                              id="edit-shiftId"
                              value={editForm.shiftId}
                              onChange={(e) => setEditForm({...editForm, shiftId: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-date">Date</Label>
                            <Input
                              id="edit-date"
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-startTime">Start Time</Label>
                            <Input
                              id="edit-startTime"
                              type="time"
                              value={editForm.startTime}
                              onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-endTime">End Time</Label>
                            <Input
                              id="edit-endTime"
                              type="time"
                              value={editForm.endTime}
                              onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Nozzleman & Pump Selection */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-nozzleman">Nozzleman</Label>
                            <Select
                              value={editForm.nozzlemanId}
                              onValueChange={(value) => setEditForm({...editForm, nozzlemanId: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select nozzleman" />
                              </SelectTrigger>
                              <SelectContent>
                                {nozzlemen.map((nozzleman) => (
                                  <SelectItem key={nozzleman._id} value={nozzleman._id}>
                                    {nozzleman.name} ({nozzleman.employeeId})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-pump">Pump</Label>
                            <Select
                              value={editForm.pumpId}
                              onValueChange={(value) => setEditForm({...editForm, pumpId: value, nozzleId: ""})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select pump" />
                              </SelectTrigger>
                              <SelectContent>
                                {pumps.map((pump) => (
                                  <SelectItem key={pump._id} value={pump._id}>
                                    {pump.name} - {pump.location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-nozzle">Nozzle</Label>
                          <Select
                            value={editForm.nozzleId}
                            onValueChange={(value) => setEditForm({...editForm, nozzleId: value})}
                            disabled={!editForm.pumpId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select nozzle" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFilteredNozzles(editForm.pumpId).map((nozzle) => (
                                <SelectItem key={nozzle._id} value={nozzle._id}>
                                  {nozzle.number} - {nozzle.fuelType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Sales Data */}
                      <div className="space-y-3">
                        <Label className="font-semibold flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Sales Data (₹)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-cashCollected">Cash Sales</Label>
                            <Input
                              id="edit-cashCollected"
                              type="number"
                              step="0.01"
                              value={editForm.cashCollected}
                              onChange={(e) => setEditForm({...editForm, cashCollected: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-phonePeSales">PhonePe</Label>
                            <Input
                              id="edit-phonePeSales"
                              type="number"
                              step="0.01"
                              value={editForm.phonePeSales}
                              onChange={(e) => setEditForm({...editForm, phonePeSales: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-posSales">POS Sales</Label>
                            <Input
                              id="edit-posSales"
                              type="number"
                              step="0.01"
                              value={editForm.posSales}
                              onChange={(e) => setEditForm({...editForm, posSales: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-otpSales">OTP Sales</Label>
                            <Input
                              id="edit-otpSales"
                              type="number"
                              step="0.01"
                              value={editForm.otpSales}
                              onChange={(e) => setEditForm({...editForm, otpSales: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-creditSales">Credit Sales</Label>
                          <Input
                            id="edit-creditSales"
                            type="number"
                            step="0.01"
                            value={editForm.creditSales}
                            onChange={(e) => setEditForm({...editForm, creditSales: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Fuel, Financials & Status */}
                    <div className="space-y-4">
                      {/* Fuel Data */}
                      <div className="space-y-3">
                        <Label className="font-semibold flex items-center gap-2">
                          <Fuel className="h-4 w-4" />
                          Fuel Data (L)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-startReading">Start Reading</Label>
                            <Input
                              id="edit-startReading"
                              type="number"
                              step="0.01"
                              value={editForm.startReading}
                              onChange={(e) => setEditForm({...editForm, startReading: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-endReading">End Reading</Label>
                            <Input
                              id="edit-endReading"
                              type="number"
                              step="0.01"
                              value={editForm.endReading}
                              onChange={(e) => setEditForm({...editForm, endReading: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-fuelDispensed">Fuel Dispensed</Label>
                            <Input
                              id="edit-fuelDispensed"
                              type="number"
                              step="0.01"
                              value={editForm.fuelDispensed}
                              onChange={(e) => setEditForm({...editForm, fuelDispensed: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-testingFuel">Testing Fuel</Label>
                            <Input
                              id="edit-testingFuel"
                              type="number"
                              step="0.01"
                              value={editForm.testingFuel}
                              onChange={(e) => setEditForm({...editForm, testingFuel: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financials */}
                      <div className="space-y-3">
                        <Label className="font-semibold flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Financials (₹)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="edit-expenses">Expenses</Label>
                            <Input
                              id="edit-expenses"
                              type="number"
                              step="0.01"
                              value={editForm.expenses}
                              onChange={(e) => setEditForm({...editForm, expenses: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-cashDeposit">Cash Deposit</Label>
                            <Input
                              id="edit-cashDeposit"
                              type="number"
                              step="0.01"
                              value={editForm.cashDeposit}
                              onChange={(e) => setEditForm({...editForm, cashDeposit: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-cashInHand">Cash in Hand</Label>
                          <Input
                            id="edit-cashInHand"
                            type="number"
                            step="0.01"
                            value={editForm.cashInHand}
                            onChange={(e) => setEditForm({...editForm, cashInHand: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>

                      {/* Status & Notes */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="edit-status">Status</Label>
                          <Select
                            value={editForm.status}
                            onValueChange={(value) => setEditForm({...editForm, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-notes">Notes</Label>
                          <Textarea
                            id="edit-notes"
                            value={editForm.notes}
                            onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                            placeholder="Add notes..."
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-auditNotes">Audit Notes</Label>
                          <Textarea
                            id="edit-auditNotes"
                            value={editForm.auditNotes}
                            onChange={(e) => setEditForm({...editForm, auditNotes: e.target.value})}
                            placeholder="Audit notes..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  
                ) : (
                  <div className="space-y-6">
                    {/* Shift Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{shift.shiftId}</h3>
                          {getStatusBadge(shift.status)}
                          {shift.isManualEntry && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Manual Entry
                            </Badge>
                          )}
                          {shift.isSimpleStart && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Zap className="h-3 w-3 mr-1" />
                              Quick Start
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>{shift.nozzleman.name} ({shift.nozzleman.employeeId})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3" />
                            <span>{shift.pump.name} - {shift.nozzle.number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{format(parseISO(shift.startTime), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => startEditing(shift)} variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => deleteShift(shift._id)} 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* LEVEL 1: Fuel & Meter Readings */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Fuel & Meter Readings
                      </h3>
                      <Level1FuelSales shift={shift} />
                    </div>

                    {/* LEVEL 2: Payment Methods */}
                    <div className="border-b pb-4">
                      <Level2PaymentMethods shift={shift} />
                    </div>

                    {/* LEVEL 2b: Expenses & Other */}
                    <div className="border-b pb-4">
                      <Level2ExpensesOther shift={shift} />
                    </div>

                    {/* LEVEL 3: Cash in Hand */}
                    <Level3CashInHand shift={shift} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          // NO SHIFTS FOUND - WITH START NEW SHIFT OPTION
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <History className="h-12 w-12 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">No shifts found matching your criteria</h3>
                  <p className="text-muted-foreground mb-4">
                    {nozzlemanFilter !== "all" ? (
                      <>
                        No shifts found for <span className="font-semibold">
                          {nozzlemen.find(n => n._id === nozzlemanFilter)?.name}
                        </span>
                      </>
                    ) : (
                      "No shifts found with the selected filters"
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  
                  {/* UPDATED: QUICK START BUTTON */}
                  {nozzlemanFilter !== "all" && nozzlemen.find(n => n._id === nozzlemanFilter) && !hasActiveShift(nozzlemanFilter) && (
                    <>
                      <Button 
                        onClick={() => {
                          const nozzleman = nozzlemen.find(n => n._id === nozzlemanFilter);
                          if (nozzleman) {
                            handleQuickStart(nozzleman._id);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={quickStarting === nozzlemanFilter || saving}
                      >
                        {quickStarting === nozzlemanFilter ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Quick Start for {nozzlemen.find(n => n._id === nozzlemanFilter)?.name}
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const nozzleman = nozzlemen.find(n => n._id === nozzlemanFilter);
                          if (nozzleman) {
                            openStartNewShiftDialog(nozzleman);
                          }
                        }}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start with Options
                      </Button>
                    </>
                  )}
                  
                </div>

              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};