// pages/SalesManagementPage.tsx - COMPLETE VERSION
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Fuel, 
  RefreshCw, 
  Users,
  CreditCard,
  Smartphone,
  Wallet,
  Receipt,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  User,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Play,
  Square,
  CheckSquare,
  Zap
} from "lucide-react";
import { SalesTable } from "@/components/Tables/SalesTable";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { addDays, format, subMonths, startOfDay, isToday, isTomorrow, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  createdAt: string;
}

interface NozzlemanSale {
  nozzleman: {
    _id: string;
    name: string;
    employeeId: string;
  };
  totalSales: number;
  phonePeSales: number;
  cashSales: number;
  posSales: number;
  otpSales: number;
  creditSales: number;
  expenses: number;
  cashDeposit: number;
  fuelDispensed: number;
  shifts: Shift[];
  meterReadings: {
    HSD: { opening: number; closing: number };
    Petrol: { opening: number; closing: number };
  };
  cashInHand: number;
}

interface NozzlemanSalesResponse {
  success: boolean;
  data: NozzlemanSale[];
  totalShifts: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  totalFuelSold: number;
  averagePrice: number;
  paymentBreakdown: {
    cash: number;
    upi: number;
    card: number;
    credit: number;
  };
  nozzlemanSales: NozzlemanSale[];
  meterReadings: {
    hsd: {
      opening: number;
      closing: number;
      sales: number;
    };
    petrol: {
      opening: number;
      closing: number;
      sales: number;
    };
  };
  expenses: number;
  cashDeposit: number;
  shiftStatus: {
    active: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface DateRange {
  from: Date;
  to: Date;
}

interface Assignment {
  _id: string;
  nozzleman: {
    _id: string;
    name: string;
    employeeId: string;
  };
  nozzle: {
    _id: string;
    number: string;
    fuelType: string;
  };
  pump: {
    _id: string;
    name: string;
    location: string;
  };
  shift: "Morning" | "Evening" | "Night";
  assignedDate: string;
  startTime: string;
  endTime: string;
  status: "Active" | "Completed" | "Cancelled";
  createdAt: string;
}

interface Nozzle {
  _id: string;
  number: string;
  fuelType: string;
  pump: {
    _id: string;
    name: string;
  };
  status: string;
  currentReading: number;
}

interface Pump {
  _id: string;
  name: string;
  location: string;
  fuelType: string;
  nozzles: Nozzle[];
}

type ViewMode = "overview" | "nozzleman-detail";

export const SalesManagementPage = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [nozzlemanSales, setNozzlemanSales] = useState<NozzlemanSale[]>([]);
  const [selectedNozzleman, setSelectedNozzleman] = useState<NozzlemanSale | null>(null);
  const [selectedNozzlemanShifts, setSelectedNozzlemanShifts] = useState<Shift[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newAssignment, setNewAssignment] = useState({
    nozzleman: "",
    nozzle: "",
    pump: "",
    shift: "Morning" as "Morning" | "Evening" | "Night",
    startTime: "08:00",
    endTime: "16:00"
  });
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalTransactions: 0,
    totalFuelSold: 0,
    averagePrice: 0,
    paymentBreakdown: {
      cash: 0,
      upi: 0,
      card: 0,
      credit: 0
    },
    nozzlemanSales: [],
    meterReadings: {
      hsd: { opening: 0, closing: 0, sales: 0 },
      petrol: { opening: 0, closing: 0, sales: 0 }
    },
    expenses: 0,
    cashDeposit: 0,
    shiftStatus: {
      active: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const { toast } = useToast();
  const [isBulkAssignmentOpen, setIsBulkAssignmentOpen] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  useEffect(() => {
    if (viewMode === "nozzleman-detail" && selectedNozzleman) {
      fetchNozzlesAndPumps();
    }
  }, [viewMode, selectedNozzleman]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');

      const [shiftsRes, nozzlemanSalesRes] = await Promise.all([
        api.get(`/api/shifts?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/api/nozzleman-sales?startDate=${startDate}&endDate=${endDate}`)
      ]);
      
      const shiftsData: Shift[] = shiftsRes.data.shifts || [];
      setShifts(shiftsData);

      const nozzlemanData: NozzlemanSalesResponse = nozzlemanSalesRes.data;
      setNozzlemanSales(nozzlemanData.data || []);

      const aggregateStats = calculateAggregateStats(shiftsData, nozzlemanData.data || []);
      setStats(aggregateStats);
      
      toast({
        title: "Data Loaded",
        description: `Showing ${shiftsData.length} shifts from ${startDate} to ${endDate}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("❌ Failed to fetch sales data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNozzlemanDetail = async (nozzlemanId: string) => {
    try {
      setDetailLoading(true);
      const [allShiftsRes, salesDetailRes, assignmentsRes] = await Promise.all([
        api.get(`/api/shifts/nozzleman/${nozzlemanId}`),
        api.get(`/api/nozzleman-sales/${nozzlemanId}?startDate=2024-01-01&endDate=${format(new Date(), 'yyyy-MM-dd')}`),
        api.get(`/api/assignments?nozzleman=${nozzlemanId}`)
      ]);

      setSelectedNozzlemanShifts(allShiftsRes.data.shifts || []);
      setAssignments(assignmentsRes.data || []);
      
      toast({
        title: "Nozzleman Data Loaded",
        description: `Showing all data for ${salesDetailRes.data.data?.nozzleman?.name || 'Nozzleman'}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("❌ Failed to fetch nozzleman detail:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch nozzleman details",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchNozzlesAndPumps = async () => {
    try {
      const [nozzlesRes, pumpsRes] = await Promise.all([
        api.get('/api/nozzles'),
        api.get('/api/pumps')
      ]);
      
      setNozzles(nozzlesRes.data || []);
      setPumps(pumpsRes.data || []);
    } catch (error: any) {
      console.error("❌ Failed to fetch nozzles/pumps:", error);
    }
  };

  const fetchAssignments = async (nozzlemanId?: string) => {
    try {
      let url = '/api/assignments';
      if (nozzlemanId) {
        url += `?nozzleman=${nozzlemanId}`;
      }
      
      const response = await api.get(url);
      setAssignments(response.data || []);
    } catch (error: any) {
      console.error("❌ Failed to fetch assignments:", error);
    }
  };

  const createAssignment = async () => {
  try {
    if (!newAssignment.nozzle || !newAssignment.pump) {
      toast({
        title: "Error",
        description: "Please select both pump and nozzle",
        variant: "destructive",
      });
      return;
    }

    // Use the selected nozzleman's ID
    const assignmentData = {
      ...newAssignment,
      assignedDate: selectedDate,
      nozzleman: selectedNozzleman?.nozzleman._id // This was missing
    };

    console.log("📝 Creating assignment with data:", assignmentData);

    const response = await api.post('/api/assignments', assignmentData);
    
    toast({
      title: "Success",
      description: "Assignment created successfully",
      variant: "default",
    });

    setIsAssignmentDialogOpen(false);
    
    // Reset form with proper values
    setNewAssignment({
      nozzleman: selectedNozzleman?.nozzleman._id || "", // Set the nozzleman ID
      nozzle: "",
      pump: "",
      shift: "Morning",
      startTime: "08:00",
      endTime: "16:00"
    });

    // Refresh assignments
    if (selectedNozzleman) {
      fetchAssignments(selectedNozzleman.nozzleman._id);
    }

  } catch (error: any) {
    console.error("❌ Failed to create assignment:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to create assignment",
      variant: "destructive",
    });
  }
};

  const removeAssignment = async (assignmentId: string) => {
    try {
      await api.delete(`/api/assignments/${assignmentId}`);
      
      toast({
        title: "Success",
        description: "Assignment removed successfully",
        variant: "default",
      });

      if (selectedNozzleman) {
        fetchAssignments(selectedNozzleman.nozzleman._id);
      }

    } catch (error: any) {
      console.error("❌ Failed to remove assignment:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  const startShiftFromAssignment = async (assignment: Assignment) => {
    try {
      const nozzleResponse = await api.get(`/api/nozzles/${assignment.nozzle._id}`);
      const currentReading = nozzleResponse.data.currentReading;

      const shiftData = {
        assignmentId: assignment._id,
        nozzleman: assignment.nozzleman._id,
        pump: assignment.pump._id,
        nozzle: assignment.nozzle._id,
        startReading: currentReading,
        startReadingImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      };

      const response = await api.post('/api/shifts/start', shiftData);
      
      toast({
        title: "Shift Started",
        description: `Shift started for ${assignment.nozzleman.name} on nozzle ${assignment.nozzle.number}`,
        variant: "default",
      });

      if (selectedNozzleman) {
        fetchNozzlemanDetail(selectedNozzleman.nozzleman._id);
      }

    } catch (error: any) {
      console.error("❌ Failed to start shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start shift",
        variant: "destructive",
      });
    }
  };

  const handleNozzlemanClick = (nozzleman: NozzlemanSale) => {
    setSelectedNozzleman(nozzleman);
    setViewMode("nozzleman-detail");
    fetchNozzlemanDetail(nozzleman.nozzleman._id);
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
    setSelectedNozzleman(null);
    setSelectedNozzlemanShifts([]);
  };

  const handleRefresh = () => {
    if (viewMode === "nozzleman-detail" && selectedNozzleman) {
      fetchNozzlemanDetail(selectedNozzleman.nozzleman._id);
    } else {
      fetchSalesData();
    }
  };

  const calculateAggregateStats = (shiftsData: Shift[], nozzlemanData: NozzlemanSale[]): SalesStats => {
    const approvedShifts = shiftsData.filter(shift => shift.status === "Approved");
    
    const totalSales = approvedShifts.reduce((sum, shift) => 
      sum + shift.cashCollected + shift.phonePeSales + shift.posSales + shift.otpSales + shift.creditSales, 0
    );
    
    const totalFuelSold = approvedShifts.reduce((sum, shift) => sum + shift.fuelDispensed, 0);
    const totalTransactions = approvedShifts.length;
    const averagePrice = totalFuelSold > 0 ? totalSales / totalFuelSold : 0;

    const paymentBreakdown = {
      cash: approvedShifts.reduce((sum, shift) => sum + shift.cashCollected, 0),
      upi: approvedShifts.reduce((sum, shift) => sum + shift.phonePeSales, 0),
      card: approvedShifts.reduce((sum, shift) => sum + shift.posSales, 0),
      credit: approvedShifts.reduce((sum, shift) => sum + shift.creditSales, 0)
    };

    const expenses = approvedShifts.reduce((sum, shift) => sum + shift.expenses, 0);
    const cashDeposit = approvedShifts.reduce((sum, shift) => sum + shift.cashDeposit, 0);

    const meterReadings = {
      hsd: {
        opening: nozzlemanData.reduce((sum, nm) => sum + nm.meterReadings.HSD.opening, 0),
        closing: nozzlemanData.reduce((sum, nm) => sum + nm.meterReadings.HSD.closing, 0),
        sales: nozzlemanData.reduce((sum, nm) => sum + (nm.meterReadings.HSD.opening - nm.meterReadings.HSD.closing), 0)
      },
      petrol: {
        opening: nozzlemanData.reduce((sum, nm) => sum + nm.meterReadings.Petrol.opening, 0),
        closing: nozzlemanData.reduce((sum, nm) => sum + nm.meterReadings.Petrol.closing, 0),
        sales: nozzlemanData.reduce((sum, nm) => sum + (nm.meterReadings.Petrol.opening - nm.meterReadings.Petrol.closing), 0)
      }
    };

    const shiftStatus = {
      active: shiftsData.filter(shift => shift.status === "Active").length,
      pending: shiftsData.filter(shift => shift.status === "Pending Approval").length,
      approved: approvedShifts.length,
      rejected: shiftsData.filter(shift => shift.status === "Rejected").length
    };

    return {
      totalSales,
      totalTransactions,
      totalFuelSold,
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      paymentBreakdown,
      nozzlemanSales: nozzlemanData,
      meterReadings,
      expenses,
      cashDeposit,
      shiftStatus
    };
  };

  const calculateNozzlemanStats = (shifts: Shift[]) => {
    const approvedShifts = shifts.filter(shift => shift.status === "Approved");
    
    const totalSales = approvedShifts.reduce((sum, shift) => 
      sum + shift.cashCollected + shift.phonePeSales + shift.posSales + shift.otpSales + shift.creditSales, 0
    );
    
    const totalFuel = approvedShifts.reduce((sum, shift) => sum + shift.fuelDispensed, 0);
    const cashSales = approvedShifts.reduce((sum, shift) => sum + shift.cashCollected, 0);
    const phonePeSales = approvedShifts.reduce((sum, shift) => sum + shift.phonePeSales, 0);
    const posSales = approvedShifts.reduce((sum, shift) => sum + shift.posSales, 0);
    const creditSales = approvedShifts.reduce((sum, shift) => sum + shift.creditSales, 0);
    const expenses = approvedShifts.reduce((sum, shift) => sum + shift.expenses, 0);
    const cashDeposit = approvedShifts.reduce((sum, shift) => sum + shift.cashDeposit, 0);
    const cashInHand = cashSales - expenses - cashDeposit;

    const meterReadings = {
      hsd: {
        opening: approvedShifts.reduce((sum, shift) => sum + shift.meterReadingHSD.opening, 0),
        closing: approvedShifts.reduce((sum, shift) => sum + shift.meterReadingHSD.closing, 0),
        sales: approvedShifts.reduce((sum, shift) => sum + (shift.meterReadingHSD.opening - shift.meterReadingHSD.closing), 0)
      },
      petrol: {
        opening: approvedShifts.reduce((sum, shift) => sum + shift.meterReadingPetrol.opening, 0),
        closing: approvedShifts.reduce((sum, shift) => sum + shift.meterReadingPetrol.closing, 0),
        sales: approvedShifts.reduce((sum, shift) => sum + (shift.meterReadingPetrol.opening - shift.meterReadingPetrol.closing), 0)
      }
    };

    return {
      totalSales,
      totalFuel,
      cashSales,
      phonePeSales,
      posSales,
      creditSales,
      expenses,
      cashDeposit,
      cashInHand,
      meterReadings,
      totalShifts: approvedShifts.length
    };
  };

  const formatNumber = (value: number | null | undefined): string => {
    return (value || 0).toLocaleString();
  };

  const formatCurrency = (value: number | null | undefined): string => {
    return `₹${(value || 0).toLocaleString()}`;
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'cash': return <Wallet className="h-4 w-4" />;
      case 'upi': return <Smartphone className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'credit': return <Receipt className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'upi': return 'bg-blue-100 text-blue-800';
      case 'card': return 'bg-purple-100 text-purple-800';
      case 'credit': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Active</Badge>;
      case 'Pending Approval':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'Approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getShiftTimings = (shift: string) => {
    switch (shift) {
      case "Morning": return { start: "06:00", end: "14:00" };
      case "Evening": return { start: "14:00", end: "22:00" };
      case "Night": return { start: "22:00", end: "06:00" };
      default: return { start: "08:00", end: "16:00" };
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "Morning": return "bg-yellow-100 text-yellow-800";
      case "Evening": return "bg-orange-100 text-orange-800";
      case "Night": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isAssignmentActive = (assignment: Assignment) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return assignment.assignedDate === today && assignment.status === "Active";
  };

  const hasActiveShift = (nozzlemanId: string) => {
    return selectedNozzlemanShifts.some(shift => 
      shift.nozzleman._id === nozzlemanId && shift.status === "Active"
    );
  };

  const renderNozzlemanDetail = () => {
    if (!selectedNozzleman) return null;

    const nozzlemanStats = calculateNozzlemanStats(selectedNozzlemanShifts);
    const todayAssignments = assignments.filter(assignment => 
      assignment.assignedDate === format(new Date(), 'yyyy-MM-dd')
    );
    const upcomingAssignments = assignments.filter(assignment => 
      assignment.assignedDate > format(new Date(), 'yyyy-MM-dd')
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBackToOverview}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedNozzleman.nozzleman.name}</h1>
              <p className="text-muted-foreground">ID: {selectedNozzleman.nozzleman.employeeId} • All Time Performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isAssignmentDialogOpen} onOpenChange={(open) => {
  setIsAssignmentDialogOpen(open);
  if (open && selectedNozzleman) {
    // Set the nozzleman when dialog opens
    setNewAssignment(prev => ({
      ...prev,
      nozzleman: selectedNozzleman.nozzleman._id
    }));
  }
}}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Nozzle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Nozzle to {selectedNozzleman.nozzleman.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment-date">Assignment Date</Label>
                    <Input
                      id="assignment-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shift">Shift</Label>
                    <Select
                      value={newAssignment.shift}
                      onValueChange={(value: "Morning" | "Evening" | "Night") => 
                        setNewAssignment(prev => ({ 
                          ...prev, 
                          shift: value,
                          ...getShiftTimings(value)
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning (6:00 - 14:00)</SelectItem>
                        <SelectItem value="Evening">Evening (14:00 - 22:00)</SelectItem>
                        <SelectItem value="Night">Night (22:00 - 6:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pump">Pump</Label>
                    <Select
                      value={newAssignment.pump}
                      onValueChange={(value) => setNewAssignment(prev => ({ ...prev, pump: value, nozzle: "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pump" />
                      </SelectTrigger>
                      <SelectContent>
                        {pumps.map((pump) => (
                          <SelectItem key={pump._id} value={pump._id}>
                            {pump.name} - {pump.location} ({pump.fuelType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nozzle">Nozzle</Label>
                    <Select
                      value={newAssignment.nozzle}
                      onValueChange={(value) => setNewAssignment(prev => ({ ...prev, nozzle: value }))}
                      disabled={!newAssignment.pump}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nozzle" />
                      </SelectTrigger>
                      <SelectContent>
                        {nozzles
                          .filter(nozzle => nozzle.pump._id === newAssignment.pump)
                          .map((nozzle) => (
                            <SelectItem key={nozzle._id} value={nozzle._id}>
                              {nozzle.number} - {nozzle.fuelType} (Current: {nozzle.currentReading}L)
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={newAssignment.startTime}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={newAssignment.endTime}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAssignment}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Assign Nozzle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleRefresh} disabled={detailLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${detailLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="animate-spin h-6 w-6 mr-2" />
            <span>Loading nozzleman details...</span>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Today's Assignments ({format(new Date(), 'MMM dd, yyyy')})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {todayAssignments.map((assignment) => (
                      <div key={assignment._id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getShiftColor(assignment.shift)}`}>
                            {assignment.shift}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {assignment.pump.name} - Nozzle {assignment.nozzle.number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.startTime} - {assignment.endTime} • {assignment.nozzle.fuelType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAssignmentActive(assignment) && !hasActiveShift(selectedNozzleman.nozzleman._id) && (
                            <Button 
                              size="sm" 
                              onClick={() => startShiftFromAssignment(assignment)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start Shift
                            </Button>
                          )}
                          {hasActiveShift(selectedNozzleman.nozzleman._id) && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Shift Active
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeAssignment(assignment._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assignments for today</p>
                    <p className="text-sm">Assign a nozzle to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {upcomingAssignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Upcoming Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingAssignments.map((assignment) => (
                      <div key={assignment._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getShiftColor(assignment.shift)}`}>
                            {assignment.shift}
                          </div>
                          <div>
                            <p className="font-medium">
                              {assignment.pump.name} - Nozzle {assignment.nozzle.number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(assignment.assignedDate), 'MMM dd, yyyy')} • {assignment.startTime} - {assignment.endTime}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeAssignment(assignment._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(nozzlemanStats.totalSales)}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time sales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Shifts Completed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{nozzlemanStats.totalShifts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Approved shifts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Fuel Dispensed</CardTitle>
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(nozzlemanStats.totalFuel)} L</div>
                  <p className="text-xs text-muted-foreground mt-1">Total fuel sold</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Per Shift</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(nozzlemanStats.totalShifts > 0 ? nozzlemanStats.totalSales / nozzlemanStats.totalShifts : 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Average sales</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Wallet className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Cash Sales</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {formatCurrency(nozzlemanStats.cashSales)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">PhonePe Sales</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {formatCurrency(nozzlemanStats.phonePeSales)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">POS Sales</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {formatCurrency(nozzlemanStats.posSales)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Receipt className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Credit Sales</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {formatCurrency(nozzlemanStats.creditSales)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">Total Revenue</span>
                      <span className="font-bold text-green-600">{formatCurrency(nozzlemanStats.totalSales)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg border-red-200 bg-red-50">
                      <span className="font-medium text-red-700">Expenses</span>
                      <span className="font-bold text-red-700">{formatCurrency(nozzlemanStats.expenses)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg border-green-200 bg-green-50">
                      <span className="font-medium text-green-700">Cash Deposit</span>
                      <span className="font-bold text-green-700">{formatCurrency(nozzlemanStats.cashDeposit)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg border-blue-200 bg-blue-50">
                      <span className="font-medium text-blue-700">Cash in Hand</span>
                      <span className="font-bold text-blue-700">{formatCurrency(nozzlemanStats.cashInHand)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Meter Reading - HSD (Diesel)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opening Balance</label>
                      <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                        {formatNumber(nozzlemanStats.meterReadings.hsd.opening)} L
                      </div>
                      <p className="text-xs text-muted-foreground">Cumulative opening</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Closing Balance</label>
                      <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                        {formatNumber(nozzlemanStats.meterReadings.hsd.closing)} L
                      </div>
                      <p className="text-xs text-muted-foreground">Cumulative closing</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900">HSD Sales:</span>
                      <span className="font-bold text-blue-700 text-lg">
                        {formatNumber(nozzlemanStats.meterReadings.hsd.sales)} L
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Meter Reading - Petrol
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opening Balance</label>
                      <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                        {formatNumber(nozzlemanStats.meterReadings.petrol.opening)} L
                      </div>
                      <p className="text-xs text-muted-foreground">Cumulative opening</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Closing Balance</label>
                      <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                        {formatNumber(nozzlemanStats.meterReadings.petrol.closing)} L
                      </div>
                      <p className="text-xs text-muted-foreground">Cumulative closing</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-900">Petrol Sales:</span>
                      <span className="font-bold text-green-700 text-lg">
                        {formatNumber(nozzlemanStats.meterReadings.petrol.sales)} L
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Shift History ({selectedNozzlemanShifts.length} shifts)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesTable shifts={selectedNozzlemanShifts} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  if (loading && viewMode === "overview") {
    return (
      <div className="min-h-screen bg-background p-6">
        <PageHeader
          title="Sales Dashboard"
          description="Complete sales breakdown with shift-based details"
        />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 mr-2" />
          <span>Loading sales data...</span>
        </div>
      </div>
    );
  }

  if (viewMode === "nozzleman-detail") {
    return (
      <div className="min-h-screen bg-background p-6">
        {renderNozzlemanDetail()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Sales Dashboard"
          description="Complete sales breakdown with shift-based details"
        />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-background">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <label htmlFor="start-date" className="text-sm font-medium whitespace-nowrap">
                From:
              </label>
              <input
                id="start-date"
                type="date"
                value={format(dateRange.from, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newFrom = new Date(e.target.value);
                  setDateRange({ from: newFrom, to: dateRange.to });
                }}
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="end-date" className="text-sm font-medium whitespace-nowrap">
                To:
              </label>
              <input
                id="end-date"
                type="date"
                value={format(dateRange.to, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newTo = new Date(e.target.value);
                  setDateRange({ from: dateRange.from, to: newTo });
                }}
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Quick:</span>
              <Button
                type="button"
                variant={dateRange.from.getTime() === dateRange.to.getTime() ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateRange({ from: today, to: today });
                }}
                className="text-xs h-8"
              >
                Today Only
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  setDateRange({ from: yesterday, to: yesterday });
                }}
                className="text-xs h-8"
              >
                Yesterday Only
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  setDateRange({ from: weekAgo, to: today });
                }}
                className="text-xs h-8"
              >
                Last 7 Days
              </Button>
            </div>
          </div>

          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nozzlemen">Nozzleman Sales</TabsTrigger>
          <TabsTrigger value="shifts">Shift Details</TabsTrigger>
          <TabsTrigger value="meter">Meter Readings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved Shifts</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.shiftStatus.approved}</div>
                <p className="text-xs text-muted-foreground mt-1">Verified shifts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.shiftStatus.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.shiftStatus.active}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.shiftStatus.rejected}</div>
                <p className="text-xs text-muted-foreground mt-1">Needs correction</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Shifts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalTransactions)}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed shifts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Fuel Sold</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalFuelSold)} L</div>
                <p className="text-xs text-muted-foreground mt-1">All products</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(stats.averagePrice || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per liter</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.expenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cash Deposit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.cashDeposit)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Bank deposit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Net Cash</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.paymentBreakdown.cash - stats.expenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cash after expenses</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nozzlemen">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Nozzleman Wise Sales Details ({nozzlemanSales.length} nozzlemen)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nozzlemanSales.map((nozzleman, index) => (
                  <div 
                    key={nozzleman.nozzleman._id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleNozzlemanClick(nozzleman)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{nozzleman.nozzleman.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {nozzleman.nozzleman.employeeId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(nozzleman.totalSales)}</p>
                        <p className="text-sm text-muted-foreground">
                          {nozzleman.shifts.length} shifts • {nozzleman.fuelDispensed}L
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-2 rounded border">
                        <p className="text-sm font-medium text-green-600">Cash Sales</p>
                        <p className="text-lg font-bold">{formatCurrency(nozzleman.cashSales)}</p>
                      </div>
                      <div className="text-center p-2 rounded border">
                        <p className="text-sm font-medium text-blue-600">PhonePe</p>
                        <p className="text-lg font-bold">{formatCurrency(nozzleman.phonePeSales)}</p>
                      </div>
                      <div className="text-center p-2 rounded border">
                        <p className="text-sm font-medium text-purple-600">POS</p>
                        <p className="text-lg font-bold">{formatCurrency(nozzleman.posSales)}</p>
                      </div>
                      <div className="text-center p-2 rounded border">
                        <p className="text-sm font-medium text-orange-600">Credit</p>
                        <p className="text-lg font-bold">{formatCurrency(nozzleman.creditSales)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-2 rounded border border-red-200 bg-red-50">
                        <p className="text-sm font-medium text-red-600">Expenses</p>
                        <p className="text-lg font-bold">{formatCurrency(nozzleman.expenses)}</p>
                      </div>
                      <div className="text-center p-2 rounded border border-green-200 bg-green-50">
                        <p className="text-sm font-medium text-green-600">Cash Deposit</p>
                        <p className="text-lg font-bold">{formatCurrency(nozzleman.cashDeposit)}</p>
                      </div>
                      <div className="text-center p-2 rounded border border-blue-200 bg-blue-50">
                        <p className="text-sm font-medium text-blue-600">Cash in Hand</p>
                        <p className="text-lg font-bold">{formatCurrency(nozzleman.cashInHand)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 rounded bg-gray-50">
                        <p className="font-medium">HSD Meter</p>
                        <p>Opening: {nozzleman.meterReadings.HSD.opening}L</p>
                        <p>Closing: {nozzleman.meterReadings.HSD.closing}L</p>
                      </div>
                      <div className="p-2 rounded bg-gray-50">
                        <p className="font-medium">Petrol Meter</p>
                        <p>Opening: {nozzleman.meterReadings.Petrol.opening}L</p>
                        <p>Closing: {nozzleman.meterReadings.Petrol.closing}L</p>
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <Badge variant="outline" className="text-xs">
                        Click to view detailed report and assign nozzles
                      </Badge>
                    </div>
                  </div>
                ))}
                {nozzlemanSales.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No nozzleman sales data available for the selected period</p>
                    <p className="text-sm">Sales data will appear here when nozzlemen complete shifts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Shift Details ({shifts.length} shifts)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesTable shifts={shifts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meter">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Meter Reading - HSD (Diesel)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Opening Balance</label>
                    <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                      {formatNumber(stats.meterReadings.hsd.opening)} L
                    </div>
                    <p className="text-xs text-muted-foreground">Cumulative opening</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Closing Balance</label>
                    <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                      {formatNumber(stats.meterReadings.hsd.closing)} L
                    </div>
                    <p className="text-xs text-muted-foreground">Cumulative closing</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">HSD Sales:</span>
                    <span className="font-bold text-blue-700 text-lg">
                      {formatNumber(stats.meterReadings.hsd.sales)} L
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Meter Reading - Petrol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Opening Balance</label>
                    <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                      {formatNumber(stats.meterReadings.petrol.opening)} L
                    </div>
                    <p className="text-xs text-muted-foreground">Cumulative opening</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Closing Balance</label>
                    <div className="p-3 border rounded bg-muted/50 font-mono text-lg">
                      {formatNumber(stats.meterReadings.petrol.closing)} L
                    </div>
                    <p className="text-xs text-muted-foreground">Cumulative closing</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-900">Petrol Sales:</span>
                    <span className="font-bold text-green-700 text-lg">
                      {formatNumber(stats.meterReadings.petrol.sales)} L
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};