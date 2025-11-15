// components/Dashboard/ShiftOverview.tsx - UPDATED
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface Shift {
  _id: string;
  shiftId: string;
  nozzleman: {
    _id: string;
    name: string;
    employeeId: string;
  } | null;
  pump: {
    _id: string;
    name: string;
  } | null;
  nozzle: {
    _id: string;
    number: string;
    fuelType: string;
  } | null;
  status: string;
  fuelDispensed: number;
  cashCollected: number;
  startTime: string;
  endTime?: string;
}

export const ShiftOverview = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveShifts();
  }, []);

  const fetchActiveShifts = async () => {
    try {
      // Use the same API endpoint as your Shift Attendance page
      const response = await api.get("/shifts");
      console.log("All shifts response:", response.data);
      
      // Filter for active and pending approval shifts only
      const activeShifts = response.data.filter((shift: Shift) => 
        shift.status === "Active" || shift.status === "Pending Approval"
      );
      
      console.log("Active shifts:", activeShifts);
      setShifts(activeShifts);
    } catch (error: any) {
      console.error("Failed to fetch shifts:", error);
      toast({
        title: "Error",
        description: "Failed to load shift data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Pending Approval":
        return "secondary";
      case "Completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Shift Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">Active and pending shifts</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shift data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Shift Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">Active and pending shifts</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Shift ID</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Nozzleman</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Pump</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Nozzle</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Start Time</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Fuel Dispensed</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Cash Collected</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  No active shifts found
                </td>
              </tr>
            ) : (
              shifts.map((shift) => (
                <tr key={shift._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-foreground">
                    {shift.shiftId}
                  </td>
                  <td className="py-4 px-4">
                    {shift.nozzleman ? (
                      <div>
                        <div className="font-medium text-foreground">{shift.nozzleman.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {shift.nozzleman.employeeId}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground">
                    {shift.pump?.name || "Unknown Pump"}
                  </td>
                  <td className="py-4 px-4">
                    {shift.nozzle ? (
                      <div>
                        <div className="text-foreground">{shift.nozzle.number}</div>
                        <div className="text-xs text-muted-foreground">
                          {shift.nozzle.fuelType}
                        </div>
                      </div>
                    ) : (
                      "Unknown Nozzle"
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-foreground">{formatDate(shift.startTime)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(shift.startTime)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-foreground">
                    {shift.fuelDispensed > 0 ? `${shift.fuelDispensed.toLocaleString()} L` : "-"}
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-foreground">
                    {shift.cashCollected > 0 ? `₹${shift.cashCollected.toLocaleString()}` : "-"}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getStatusVariant(shift.status)}>
                      {shift.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};