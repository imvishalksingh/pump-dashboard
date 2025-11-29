// components/Dashboard/ShiftOverview.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface ShiftStats {
  active: number;
  completed: number;
  pending: number;
  totalNozzlemen: number;
}

export const ShiftOverview = () => {
  const [stats, setStats] = useState<ShiftStats>({
    active: 0,
    completed: 0,
    pending: 0,
    totalNozzlemen: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchShiftData();
  }, []);

  const fetchShiftData = async () => {
    try {
      console.log("🔄 Fetching shift data...");
      const [shiftStats, shiftsData] = await Promise.all([
        api.get("/api/shifts/stats").catch(err => {
          console.warn("Shift stats not available:", err.message);
          return { data: { activeShifts: 0, pendingApprovals: 0 } };
        }),
        api.get("/api/shifts").catch(err => {
          console.warn("Shifts data not available:", err.message);
          return { data: { shifts: [] } };
        })
      ]);

      const shiftStatsData = shiftStats.data || {};
      const shifts = shiftsData.data?.shifts || [];

      // Calculate unique nozzlemen from shifts
      const uniqueNozzlemen = new Set();
      shifts.forEach((shift: any) => {
        if (shift.nozzleman && shift.nozzleman._id) {
          uniqueNozzlemen.add(shift.nozzleman._id);
        }
      });

      setStats({
        active: shiftStatsData.activeShifts || 0,
        completed: shifts.filter((s: any) => s.status === 'Approved' || s.status === 'Completed').length,
        pending: shiftStatsData.pendingApprovals || 0,
        totalNozzlemen: uniqueNozzlemen.size
      });

      console.log("✅ Shift stats:", stats);

    } catch (error: any) {
      console.error("❌ Failed to fetch shift data:", error);
      toast({
        title: "Error",
        description: "Failed to load shift overview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-32"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-6 bg-muted rounded w-8"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-foreground">Shift Overview</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Active Shifts</p>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg font-semibold">
            {stats.active}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Completed Today</p>
              <p className="text-xs text-muted-foreground">Approved shifts</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-foreground">{stats.completed}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pending Approval</p>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </div>
          </div>
          <Badge variant="destructive" className="text-lg font-semibold">
            {stats.pending}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Total Nozzlemen</p>
              <p className="text-xs text-muted-foreground">Active today</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-foreground">{stats.totalNozzlemen}</span>
        </div>
      </div>
    </Card>
  );
};