// components/Audit/PendingShiftsAudit.tsx - FIXED VERSION
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calculator, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface PendingShift {
  _id: string;
  shiftId: string;
  nozzleman: {
    _id: string;
    name: string;
    employeeId?: string;
  };
  nozzle: {
    _id: string;
    name: string;
    fuelType: string;
    rate: number;
  };
  startTime: string;
  endTime: string;
  startReading: number;
  endReading: number;
  fuelDispensed: number;
  cashCollected: number;
  expectedCash?: number;
  discrepancy?: number;
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
      const response = await axios.get("/api/audit/shifts/pending");
      console.log("📋 Pending shifts response:", response.data);
      setShifts(response.data);
    } catch (error: any) {
      console.error("Failed to fetch pending shifts:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load pending shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveShift = async (shiftId: string, notes?: string) => {
    try {
      setProcessingId(shiftId);
      console.log("✅ Approving shift:", shiftId);
      
      const response = await axios.post(`/api/audit/shifts/${shiftId}/approve`, {
        approved: true,
        notes: notes || "Auditor approved - discrepancy accepted"
      });
      
      console.log("✅ Shift approval response:", response.data);
      
      toast({
        title: "Shift Approved",
        description: "Shift has been approved successfully",
      });
      
      fetchPendingShifts();
      onUpdate();
    } catch (error: any) {
      console.error("❌ Failed to approve shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve shift",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectShift = async (shiftId: string, reason: string) => {
  try {
    setProcessingId(shiftId);
    
    const response = await axios.post(`/api/audit/shifts/${shiftId}/approve`, {
      approved: false,
      notes: reason
    });
    
    toast({
      title: "Shift Rejected",
      description: "Shift has been rejected. Cash handover will remain for separate verification.", // ✅ Clear message
    });
    
    fetchPendingShifts();
    onUpdate();
  } catch (error: any) {
      console.error("❌ Failed to reject shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject shift",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const calculateExpectedCash = (fuelDispensed: number, rate: number) => {
    return fuelDispensed * rate;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h8 animate-spin text-primary" />
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
        <Button variant="outline" onClick={fetchPendingShifts}>
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {shifts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p>No pending shifts for approval</p>
            <p className="text-sm mt-1">All shifts have been verified</p>
          </div>
        ) : (
          shifts.map((shift) => {
            const expectedCash = calculateExpectedCash(shift.fuelDispensed, shift.nozzle.rate);
            const cashDifference = shift.cashCollected - expectedCash;
            const hasDiscrepancy = Math.abs(cashDifference) > 10; // 10 rupees tolerance

            return (
              <div key={shift._id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-foreground">{shift.nozzleman.name}</p>
                      <Badge variant="outline">{shift.shiftId}</Badge>
                      <Badge variant={hasDiscrepancy ? "destructive" : "default"}>
                        {hasDiscrepancy ? "Discrepancy Found" : "No Issues"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shift.nozzle.name} ({shift.nozzle.fuelType}) • Rate: ₹{shift.nozzle.rate}/L
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(shift.startTime).toLocaleDateString()} • 
                      {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-muted-foreground">Fuel Dispensed</p>
                    <p className="font-semibold text-foreground">{shift.fuelDispensed} L</p>
                    <p className="text-xs text-muted-foreground">
                      Meter: {shift.startReading} → {shift.endReading}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-muted-foreground">Cash Collected</p>
                    <p className="font-semibold text-foreground">₹{shift.cashCollected.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-muted-foreground">Expected Cash</p>
                    <p className="font-semibold text-foreground">₹{expectedCash.toLocaleString()}</p>
                    <p className="text-xs">({shift.fuelDispensed}L × ₹{shift.nozzle.rate})</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${
                    hasDiscrepancy ? "bg-red-50" : "bg-green-50"
                  }`}>
                    <p className="text-muted-foreground">Difference</p>
                    <p className={`font-semibold ${
                      hasDiscrepancy ? "text-red-600" : "text-green-600"
                    }`}>
                      {cashDifference >= 0 ? "+" : ""}₹{Math.abs(cashDifference).toLocaleString()}
                    </p>
                    <p className="text-xs">
                      {hasDiscrepancy ? "Mismatch detected" : "Within tolerance"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Formula: Fuel ({shift.fuelDispensed}L) × Rate (₹{shift.nozzle.rate}) = ₹{expectedCash.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDiscrepancy && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectShift(
                          shift._id, 
                          `Cash discrepancy detected. Expected: ₹${expectedCash.toLocaleString()}, Collected: ₹${shift.cashCollected.toLocaleString()}`
                        )}
                        disabled={processingId === shift._id}
                      >
                        {processingId === shift._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        Reject
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproveShift(shift._id)}
                      disabled={processingId === shift._id}
                    >
                      {processingId === shift._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      {hasDiscrepancy ? "Approve Anyway" : "Approve"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};