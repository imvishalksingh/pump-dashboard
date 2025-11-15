// components/Tables/ShiftTable.tsx - FIXED VERSION
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Play, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

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
  startTime: string;
  endTime?: string;
  startReading: number;
  endReading?: number;
  fuelDispensed: number;
  cashCollected: number;
  status: string;
  notes?: string;
  createdBy: {
    name: string;
    email: string;
  };
}

interface ShiftTableProps {
  refresh?: number;
}

export const ShiftTable = ({ refresh = 0 }: ShiftTableProps) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
  }, [refresh]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/shifts");
      console.log("Shifts API Response:", response.data);
      setShifts(response.data);
    } catch (error: any) {
      console.error("Failed to fetch shifts:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async (shiftId: string) => {
    // You'll need to implement this or open a modal
    console.log("End shift:", shiftId);
  };

  const handleApproveShift = async (shiftId: string) => {
    try {
      await axios.put(`/api/shifts/${shiftId}`, { status: "Completed" });
      toast({
        title: "Success",
        description: "Shift approved successfully",
      });
      fetchShifts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve shift",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Completed":
        return "secondary";
      case "Pending Approval":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Play className="h-4 w-4" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Pending Approval":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading shifts...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shift ID</TableHead>
            <TableHead>Nozzleman</TableHead>
            <TableHead>Pump</TableHead>
            <TableHead>Nozzle</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Fuel Dispensed</TableHead>
            <TableHead>Cash Collected</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No shifts found. Start a new shift to begin tracking.
              </TableCell>
            </TableRow>
          ) : (
            shifts.map((shift) => (
              <TableRow key={shift._id}>
                <TableCell className="font-medium">{shift.shiftId}</TableCell>
                <TableCell>
                  {shift.nozzleman ? (
                    <div>
                      <div className="font-medium">{shift.nozzleman.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {shift.nozzleman.employeeId}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {shift.pump?.name || "Unknown Pump"}
                </TableCell>
                <TableCell>
                  {shift.nozzle ? (
                    <div>
                      <div>{shift.nozzle.number}</div>
                      <div className="text-xs text-muted-foreground">
                        {shift.nozzle.fuelType}
                      </div>
                    </div>
                  ) : (
                    "Unknown Nozzle"
                  )}
                </TableCell>
                <TableCell>
                  <div>{formatDate(shift.startTime)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(shift.startTime)}
                  </div>
                </TableCell>
                <TableCell>
                  {shift.endTime ? (
                    <div>
                      <div>{formatDate(shift.endTime)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(shift.endTime)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {shift.fuelDispensed > 0 ? (
                    `${shift.fuelDispensed.toLocaleString()} L`
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {shift.cashCollected > 0 ? (
                    `₹${shift.cashCollected.toLocaleString()}`
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(shift.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(shift.status)}
                    {shift.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {shift.status === "Active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEndShift(shift._id)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        End
                      </Button>
                    )}
                    {shift.status === "Pending Approval" && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveShift(shift._id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};