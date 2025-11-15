// pages/ShiftAttendancePage.tsx
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Users, TrendingUp, Clock } from "lucide-react";
import { ShiftTable } from "@/components/Tables/ShiftTable";
import { ShiftStartModal } from "@/components/Modals/ShiftStartModal";
import { ShiftEndModal } from "@/components/Modals/ShiftEndModal";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface ShiftStats {
  activeShifts: number;
  totalDispensed: number;
  pendingApprovals: number;
}

export const ShiftAttendancePage = () => {
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [stats, setStats] = useState<ShiftStats>({
    activeShifts: 0,
    totalDispensed: 0,
    pendingApprovals: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchShiftStats();
  }, [refreshTrigger]);

  const fetchShiftStats = async () => {
    try {
      const response = await api.get("/shifts/stats"); // You'll need to create this endpoint
      setStats(response.data);
    } catch (error: any) {
      console.error("Failed to fetch shift stats:", error);
    }
  };

  const handleShiftStarted = () => {
    setStartModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Success",
      description: "Shift started successfully",
    });
  };

  const handleShiftEnded = () => {
    setEndModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Success",
      description: "Shift ended successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Shift & Attendance Management"
        description="Track shifts, attendance, and fuel dispensing"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setStartModalOpen(true)}>
              <Play className="mr-2 h-4 w-4" />
              Start Shift
            </Button>
            <Button variant="outline" onClick={() => setEndModalOpen(true)}>
              <Square className="mr-2 h-4 w-4" />
              End Shift
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeShifts}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dispensed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDispensed.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground mt-1">All shifts today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Records</CardTitle>
        </CardHeader>
        <CardContent>
          <ShiftTable refresh={refreshTrigger} />
        </CardContent>
      </Card>

      <ShiftStartModal 
        open={startModalOpen} 
        onOpenChange={setStartModalOpen}
        onShiftStarted={handleShiftStarted}
      />
      
      <ShiftEndModal 
        open={endModalOpen} 
        onOpenChange={setEndModalOpen}
        onShiftEnded={handleShiftEnded}
      />
    </div>
  );
};