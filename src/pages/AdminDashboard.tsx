import { DollarSign, Package, Users, CheckCircle } from "lucide-react";
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
    totalStock: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use your existing API endpoints
      const [salesStats, shiftStats, stockStats] = await Promise.all([
        api.get("/sales/stats"),
        api.get("/shifts/stats"),
        api.get("/stock/stats") // You might need to create this if not exists
      ]);

      console.log("📊 Dashboard Data:", {
        sales: salesStats.data,
        shifts: shiftStats.data,
        stock: stockStats.data
      });

      // Calculate total stock from stock stats
      const totalStock = stockStats.data?.products?.reduce((sum: number, product: any) => 
        sum + (product.closingStock || 0), 0) || 0;

      setStats({
        totalSales: salesStats.data.totalSales || 0,
        totalTransactions: salesStats.data.totalTransactions || 0,
        totalFuelSold: salesStats.data.totalFuelSold || 0,
        averagePrice: salesStats.data.averagePrice || 0,
        activeShifts: shiftStats.data.activeShifts || 0,
        totalDispensed: shiftStats.data.totalDispensed || 0,
        pendingApprovals: shiftStats.data.pendingApprovals || 0,
        totalStock: totalStock
      });

    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
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
    return `₹${(value || 0).toLocaleString()}`;
  };

  // Calculate percentage changes (you can replace with actual historical data)
  const calculateSalesChange = () => {
    // For now, using mock data - you can implement actual comparison with yesterday
    return "+12.5%";
  };

  const calculateStockChange = () => {
    // For now, using mock data - you can implement actual comparison
    return "-5.2%";
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
          change={calculateSalesChange()}
          changeType="positive"
          subtitle={`${stats.totalTransactions} transactions`}
          // loading={loading}
        />
        <StatCard
          title="Total Stock"
          value={`${stats.totalStock.toLocaleString()} L`}
          icon={Package}
          change={calculateStockChange()}
          changeType="negative"
          subtitle="Available fuel"
          // loading={loading}
        />
        <StatCard
          title="Active Shifts"
          value={stats.activeShifts.toString()}
          icon={Users}
          subtitle={`${stats.totalDispensed.toLocaleString()}L dispensed`}
          // loading={loading}
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