// components/Audit/PendingShiftsAudit.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calculator, Loader2, Fuel } from "lucide-react"; // Added Fuel icon
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

// ✅ Updated Interface
interface PendingShift {
  _id: string;
  shiftId: string;
  nozzleman: {
    _id: string;
    name: string;
    employeeId?: string;
  };
  // New Multi-Nozzle Structure
  nozzleReadings: Array<{
    nozzle: {
        number: string;
        fuelType: string;
        rate: number;
    };
    openingReading: number;
    closingReading: number;
    fuelDispensed: number;
    salesAmount: number;
  }>;
  startTime: string;
  endTime: string;
  cashCollected: number;
  expectedCash: number; // Calculated by backend
  discrepancy: number;  // Calculated by backend
  status: "Pending Approval";
  notes?: string;
}

interface PendingShiftsAuditProps {
  onUpdate: () => void;
}

export const PendingShiftsAudit = ({ onUpdate }: PendingShiftsAuditProps) => {
  const [shifts, setShifts] = useState<PendingShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingShifts();
  }, []);

  const fetchPendingShifts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/audit/shifts/pending");
      setShifts(response.data);
    } catch (error: any) {
      console.error("Failed to fetch pending shifts:", error);
      toast({
        title: "Error",
        description: "Failed to load pending shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveShift = async (shiftId: string, notes?: string) => {
    try {
      setProcessingId(shiftId);
      await api.post(`/api/audit/shifts/${shiftId}/approve`, {
        approved: true,
        notes: notes || "Auditor approved"
      });
      
      toast({ title: "Shift Approved", description: "Shift approved successfully" });
      fetchPendingShifts();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to approve shift", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectShift = async (shiftId: string, reason: string) => {
    try {
      setProcessingId(shiftId);
      await api.post(`/api/audit/shifts/${shiftId}/approve`, {
        approved: false,
        notes: reason
      });
      
      toast({ title: "Shift Rejected", description: "Shift rejected successfully" });
      fetchPendingShifts();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to reject shift", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pending Shift Approvals</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Verify fuel dispensed matches cash collected
          </p>
        </div>
        <Button variant="outline" onClick={fetchPendingShifts}>Refresh</Button>
      </div>

      <div className="space-y-4">
        {shifts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p>No pending shifts for approval</p>
          </div>
        ) : (
          shifts.map((shift) => {
            // Calculate aggregated fuel
            const totalFuel = shift.nozzleReadings?.reduce((sum, n) => sum + (n.fuelDispensed || 0), 0) || 0;
            const hasDiscrepancy = Math.abs(shift.discrepancy) > 10;

            return (
              <div key={shift._id} className="p-4 border rounded-lg bg-card shadow-sm">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-foreground text-lg">{shift.nozzleman?.name}</p>
                      <Badge variant="outline">{shift.shiftId}</Badge>
                      <Badge variant={hasDiscrepancy ? "destructive" : "default"}>
                        {hasDiscrepancy ? "Discrepancy Found" : "Balanced"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(shift.startTime).toLocaleString()} - {shift.endTime ? new Date(shift.endTime).toLocaleTimeString() : 'Ongoing'}
                    </p>
                  </div>
                  
                  {/* Nozzle Breakdown */}
                  <div className="flex-1 md:max-w-md">
                      <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Nozzle Readings</div>
                      <div className="grid gap-2">
                        {shift.nozzleReadings?.map((reading, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                                <div className="flex items-center gap-2">
                                    <Fuel className="w-3 h-3 text-blue-500" />
                                    <span>{reading.nozzle?.number || `N${idx+1}`}</span>
                                    <span className="text-muted-foreground">({reading.nozzle?.fuelType})</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground text-xs">
                                        {reading.openingReading} → {reading.closingReading || '-'}
                                    </span>
                                    <span className="font-medium">{reading.fuelDispensed}L</span>
                                </div>
                            </div>
                        ))}
                      </div>
                  </div>
                </div>

                {/* Totals Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 pt-4 border-t">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-muted-foreground">Total Fuel</p>
                    <p className="font-semibold text-foreground text-lg">{totalFuel.toLocaleString()} L</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-muted-foreground">Expected Cash</p>
                    <p className="font-semibold text-foreground text-lg">₹{shift.expectedCash.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-muted-foreground">Collected Cash</p>
                    <p className="font-semibold text-foreground text-lg">₹{shift.cashCollected.toLocaleString()}</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${hasDiscrepancy ? "bg-red-50" : "bg-green-50"}`}>
                    <p className="text-muted-foreground">Difference</p>
                    <p className={`font-semibold text-lg ${hasDiscrepancy ? "text-red-600" : "text-green-600"}`}>
                      {shift.discrepancy > 0 ? "+" : ""}₹{Math.abs(shift.discrepancy).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  {hasDiscrepancy && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRejectShift(
                        shift._id, 
                        `Discrepancy of ₹${shift.discrepancy} detected.`
                      )}
                      disabled={processingId === shift._id}
                    >
                      {processingId === shift._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                      Reject
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApproveShift(shift._id)}
                    disabled={processingId === shift._id}
                  >
                    {processingId === shift._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                    {hasDiscrepancy ? "Approve with Discrepancy" : "Approve"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};