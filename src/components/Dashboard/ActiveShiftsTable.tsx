import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface ActiveShift {
  _id: string;
  shiftId: string;
  nozzleman: {
    _id: string;
    name: string;
  };
  nozzle: {
    _id: string;
    name: string;
    fuelType: string;
  };
  startTime: string;
  startReading: number;
  endReading?: number;
  fuelDispensed?: number;
  cashCollected?: number;
  status: "Active" | "Completed" | "Pending Approval";
}

export const ActiveShiftsTable = () => {
  const [activeShifts, setActiveShifts] = useState<ActiveShift[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveShifts();
  }, []);

  const fetchActiveShifts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/shifts");
      
      // Filter only active shifts and transform data
      const shifts = response.data
        .filter((shift: any) => shift.status === "Active")
        .map((shift: any) => ({
          _id: shift._id,
          shiftId: shift.shiftId,
          nozzleman: shift.nozzleman || { name: "Unknown Nozzleman" },
          nozzle: shift.nozzle || { name: "Unknown Nozzle", fuelType: "Fuel" },
          startTime: shift.startTime,
          startReading: shift.startReading || 0,
          endReading: shift.endReading,
          fuelDispensed: shift.fuelDispensed || 0,
          cashCollected: shift.cashCollected || 0,
          status: shift.status
        }));
      
      setActiveShifts(shifts);
    } catch (error: any) {
      console.error("Failed to fetch active shifts:", error);
      toast({
        title: "Error",
        description: "Failed to load active shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async (shiftId: string, currentReading: number) => {
    try {
      // In a real scenario, you'd get the end reading from user input
      // For now, using current reading + some dispensed amount for demo
      const endReading = currentReading + Math.floor(Math.random() * 1000) + 500;
      const cashCollected = Math.floor(Math.random() * 50000) + 10000;
      
      await axios.put(`/api/shifts/end/${shiftId}`, {
        endReading,
        cashCollected,
        notes: "Shift ended from dashboard"
      });
      
      toast({
        title: "Success",
        description: "Shift ended successfully",
      });
      fetchActiveShifts(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to end shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to end shift",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Active Shifts</h3>
            <p className="text-sm text-muted-foreground mt-1">Current staff on duty</p>
          </div>
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Active Shifts</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {activeShifts.length} shift(s) currently active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchActiveShifts}
            disabled={loading}
          >
            Refresh
          </Button>
          <Clock className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        {activeShifts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active shifts at the moment
          </div>
        ) : (
          activeShifts.map((shift) => (
            <div
              key={shift._id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {shift.nozzleman.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shift.nozzle.name} ({shift.nozzle.fuelType})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shift ID: {shift.shiftId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500 text-white">
                    Active
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEndShift(shift._id, shift.startReading)}
                  >
                    End Shift
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Time</p>
                  <p className="font-medium text-foreground">
                    {formatTime(shift.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Reading</p>
                  <p className="font-medium text-foreground">
                    {shift.startReading.toLocaleString()} L
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fuel Dispensed</p>
                  <p className="font-medium text-foreground">
                    {shift.fuelDispensed ? `${shift.fuelDispensed} L` : "In progress"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cash Collected</p>
                  <p className="font-medium text-foreground">
                    {shift.cashCollected ? `₹${shift.cashCollected.toLocaleString()}` : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View All Shifts
      </Button>
    </Card>
  );
};