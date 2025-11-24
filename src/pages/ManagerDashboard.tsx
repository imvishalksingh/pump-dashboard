import { DollarSign, Users, CheckCircle, Droplet } from "lucide-react";
import { StatCard } from "@/components/Dashboard/StatCard";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { ActiveShiftsTable } from "@/components/Dashboard/ActiveShiftsTable";
import { PendingApprovalsTable } from "@/components/Dashboard/PendingApprovalsTable";
import { LowStockWidget } from "@/components/Dashboard/LowStockWidget";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface ManagerStats {
  totalSales: number;
  totalTransactions: number;
  activeShifts: number;
  totalDispensed: number;
  pendingApprovals: number;
  totalStock: number;
}

const ManagerDashboard = () => {
  const [stats, setStats] = useState<ManagerStats>({
    totalSales: 0,
    totalTransactions: 0,
    activeShifts: 0,
    totalDispensed: 0,
    pendingApprovals: 0,
    totalStock: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      const [salesStats, shiftStats, stockStats] = await Promise.all([
        api.get("/api/sales/stats"),
        api.get("/api/shifts/stats"),
        api.get("/api/stock/stats")
      ]);

      const totalStock = stockStats.data?.products?.reduce((sum: number, product: any) => 
        sum + (product.closingStock || 0), 0) || 0;

      setStats({
        totalSales: salesStats.data.totalSales || 0,
        totalTransactions: salesStats.data.totalTransactions || 0,
        activeShifts: shiftStats.data.activeShifts || 0,
        totalDispensed: shiftStats.data.totalDispensed || 0,
        pendingApprovals: shiftStats.data.pendingApprovals || 0,
        totalStock: totalStock
      });

    } catch (error: any) {
      console.error("Failed to fetch manager data:", error);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor operations and manage approvals.</p>
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
          changeType="neutral"
          subtitle="Requires action"
          loading={loading}
        />
        <StatCard
          title="Stock Remaining"
          value={`${stats.totalStock.toLocaleString()} L`}
          icon={Droplet}
          change="-5.2%"
          changeType="negative"
          subtitle="Total fuel available"
          loading={loading}
        />
      </div>

      {/* Sales Chart */}
      <SalesChart />

      {/* Active Shifts and Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveShiftsTable />
        <PendingApprovalsTable />
      </div>

      {/* Low Stock Widget */}
      <LowStockWidget />
    </div>
  );
};

export default ManagerDashboard;