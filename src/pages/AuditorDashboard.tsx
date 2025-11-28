import { Shield, Clock, DollarSign, Droplet, FileCheck, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/Dashboard/StatCard";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { AuditReport } from "@/components/Audit/AuditReport";
import { FuelStockAudit } from "@/components/Audit/FuelStockAudit";
import { SalesRecordsAudit } from "@/components/Audit/SalesRecordsAudit";
import { PendingShiftsAudit } from "@/components/Audit/PendingShiftsAudit";
import { CashExpenseAudit } from "@/components/Audit/CashExpenseAudit";
import { Button } from "@/components/ui/button";

interface AuditorStats {
  pendingShifts: number;
  pendingCashEntries: number;
  stockDiscrepancies: number;
  pendingSalesAudits: number;
  totalApproved: number;
  totalRejected: number;
}

const AuditorDashboard = () => {
  const [stats, setStats] = useState<AuditorStats>({
    pendingShifts: 0,
    pendingCashEntries: 0,
    stockDiscrepancies: 0,
    pendingSalesAudits: 0,
    totalApproved: 0,
    totalRejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("shifts");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditorStats();
  }, [refreshTrigger]);

  const fetchAuditorStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/audit/stats");
      setStats(response.data);
      console.log("✅ Auditor stats loaded:", response.data);
    } catch (error: any) {
      console.error("❌ Failed to fetch auditor stats:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load auditor dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Refreshing",
      description: "Updating auditor statistics...",
    });
  };

  const handleUpdateStats = () => {
    // This function will be passed to child components
    fetchAuditorStats();
  };

  const tabs = [
    { id: "shifts", name: "Shift Reports", icon: Clock, count: stats.pendingShifts },
    { id: "cash", name: "Cash & Expenses", icon: DollarSign, count: stats.pendingCashEntries },
    { id: "stock", name: "Fuel Stock", icon: Droplet, count: stats.stockDiscrepancies },
    { id: "sales", name: "Sales Records", icon: FileCheck, count: stats.pendingSalesAudits },
    { id: "report", name: "Audit Report", icon: Shield, count: stats.totalApproved + stats.totalRejected }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "shifts":
        return <PendingShiftsAudit onUpdate={handleUpdateStats} />;
      case "cash":
        return <CashExpenseAudit onUpdate={handleUpdateStats} />;
      case "stock":
        return <FuelStockAudit onUpdate={handleUpdateStats} />;
      case "sales":
        return <SalesRecordsAudit onUpdate={handleUpdateStats} />;
      case "report":
        // return <AuditReport onUpdate={handleUpdateStats} />;
      default:
        return <PendingShiftsAudit onUpdate={handleUpdateStats} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Auditor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Verify and approve daily operations, detect discrepancies
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Approved: {stats.totalApproved}</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span>Rejected: {stats.totalRejected}</span>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Shifts"
          value={stats.pendingShifts.toString()}
          icon={Clock}
          changeType="neutral"
          subtitle="Require verification"
          loading={loading}
        />
        <StatCard
          title="Cash Entries"
          value={stats.pendingCashEntries.toString()}
          icon={DollarSign}
          changeType="neutral"
          subtitle="Need approval"
          loading={loading}
        />
        <StatCard
          title="Stock Issues"
          value={stats.stockDiscrepancies.toString()}
          icon={Droplet}
          changeType="negative"
          subtitle="Discrepancies found"
          loading={loading}
        />
        <StatCard
          title="Sales Audits"
          value={stats.pendingSalesAudits.toString()}
          icon={FileCheck}
          changeType="neutral"
          subtitle="Pending review"
          loading={loading}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                  activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default AuditorDashboard;