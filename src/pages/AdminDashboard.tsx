// components/Dashboard/AdminDashboard.tsx
import { DollarSign, Package, Users, CheckCircle, TrendingUp, Fuel, Clock, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/Dashboard/StatCard";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { StockTable } from "@/components/Dashboard/StockTable";
import { RecentTransactions } from "@/components/Dashboard/RecentTransactions";
import { AlertsWidget } from "@/components/Dashboard/AlertsWidget";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { ShiftOverview } from "@/components/Dashboard/ShiftOverview";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalSales: number;
  totalTransactions: number;
  totalFuelSold: number;
  averagePrice: number;
  activeShifts: number;
  totalDispensed: number;
  pendingApprovals: number;
  totalStock: number;
  lowStockAlerts: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalTransactions: 0,
    totalFuelSold: 0,
    averagePrice: 0,
    activeShifts: 0,
    totalDispensed: 0,
    pendingApprovals: 0,
    totalStock: 0,
    lowStockAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    console.log("🔄 Fetching dashboard data from nozzleman-sales...");
    
    // Get date range for today
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch nozzleman sales data for today
    const nozzlemanSalesResponse = await api.get(`/api/nozzleman-sales?startDate=${today}&endDate=${today}`)
      .catch(err => {
        console.warn("Nozzleman sales not available:", err.message);
        return { data: { data: [], totalRevenue: 0, totalShifts: 0 } };
      });

    const nozzlemanData = nozzlemanSalesResponse.data.data || [];
    const totalRevenue = nozzlemanSalesResponse.data.totalRevenue || 0;
    const totalShifts = nozzlemanSalesResponse.data.totalShifts || 0;

    console.log("📊 Nozzleman sales data:", {
      nozzlemen: nozzlemanData.length,
      totalRevenue,
      totalShifts
    });

    // Calculate totals from nozzleman data
    let totalFuelSold = 0;
    let totalTransactions = 0;
    let activeShifts = 0;
    let pendingApprovals = 0;

    nozzlemanData.forEach((nozzleman: any) => {
      totalFuelSold += nozzleman.fuelDispensed || 0;
      totalTransactions += nozzleman.totalShifts || 0;
      
      if (nozzleman.shifts) {
        nozzleman.shifts.forEach((shift: any) => {
          if (shift.status === "Pending Approval") {
            pendingApprovals += 1;
          }
          if (shift.status === "Completed" || shift.status === "Pending Approval") {
            activeShifts += 1;
          }
        });
      }
    });

    // Fetch other stats (stock, etc.)
    const [stockStats] = await Promise.all([
      api.get("/api/stock/stats").catch(err => {
        console.warn("Stock stats not available:", err.message);
        return { data: { totalCurrent: 0, lowStockAlerts: 0 } };
      })
    ]);

    const stockData = stockStats.data || {};

    setStats({
      totalSales: totalRevenue,
      totalTransactions: totalTransactions,
      totalFuelSold: totalFuelSold,
      averagePrice: totalFuelSold > 0 ? totalRevenue / totalFuelSold : 0,
      activeShifts: activeShifts,
      totalDispensed: totalFuelSold,
      pendingApprovals: pendingApprovals,
      totalStock: stockData.totalCurrent || 0,
      lowStockAlerts: stockData.lowStockAlerts || 0
    });

  } catch (error: any) {
    console.error("❌ Failed to fetch dashboard data:", error);
    toast({
      title: "Error",
      description: "Failed to load dashboard data",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const formatCurrency = (value: number) => {
    return `₹${(value || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your petrol pump overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.totalSales)}
          icon={DollarSign}
          change="+12.5%"
          changeType="positive"
          subtitle={`${stats.totalTransactions} transactions`}
          loading={loading}
        />
        <StatCard
          title="Total Stock"
          value={`${stats.totalStock.toLocaleString()} L`}
          icon={Package}
          change="-5.2%"
          changeType="negative"
          subtitle="Available fuel"
          loading={loading}
        />
        <StatCard
          title="Active Shifts"
          value={stats.activeShifts.toString()}
          icon={Users}
          subtitle={`${stats.totalDispensed.toLocaleString()}L dispensed`}
          loading={loading}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals.toString()}
          icon={CheckCircle}
          subtitle="Requires action"
          loading={loading}
        />
      </div>

      {/* Sales Chart */}
      <SalesChart />

      {/* Stock and Shift Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockTable />
        <ShiftOverview />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsWidget />
        <QuickActions />
      </div>
    </div>
  );
};

export default AdminDashboard;