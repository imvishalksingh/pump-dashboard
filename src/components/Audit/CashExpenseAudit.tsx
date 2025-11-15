// components/Audit/CashExpenseAudit.tsx - ENHANCED WITH REJECTION MESSAGES
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText, Banknote, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface CashEntry {
  _id: string;
  shift: {
    _id: string;
    shiftId: string;
    status: string;
    nozzleman: { 
      name: string;
      employeeId?: string;
    };
    auditNotes?: string;
  };
  nozzleman: {
    _id: string;
    name: string;
    employeeId?: string;
  };
  amount: number;
  status: "Pending" | "Verified" | "Rejected";
  notes?: string;
  verificationNotes?: string;
  verifiedBy?: {
    name: string;
  };
  verifiedAt?: string;
  createdAt: string;
}

interface CashExpenseAuditProps {
  onUpdate: () => void;
}

export const CashExpenseAudit = ({ onUpdate }: CashExpenseAuditProps) => {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingEntries();
  }, []);

  const fetchPendingEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/audit/cash/pending");
      console.log("💰 Cash entries response:", response.data);
      setEntries(response.data);
    } catch (error: any) {
      console.error("Failed to fetch cash entries:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load cash entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEntry = async (entryId: string, approved: boolean, notes?: string) => {
    try {
      setProcessingId(entryId);
      console.log(`🔄 ${approved ? 'Verifying' : 'Rejecting'} cash entry:`, entryId);
      
      const response = await api.post(`/audit/cash/${entryId}/verify`, {
        approved,
        notes
      });
      
      console.log("✅ Cash entry response:", response.data);
      
      toast({
        title: approved ? "Cash Verified" : "Cash Rejected",
        description: `Cash handover has been ${approved ? "verified" : "rejected"}`,
      });
      
      fetchPendingEntries();
      onUpdate();
    } catch (error: any) {
      console.error("Failed to verify entry:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify entry",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (entry: CashEntry) => {
    if (entry.status === "Rejected") {
      return <Badge variant="destructive">Rejected by Auditor</Badge>;
    }
    if (entry.status === "Verified") {
      return <Badge variant="default" className="bg-green-100 text-green-800">Verified by Auditor</Badge>;
    }
    
    // For pending entries, show shift status
    switch (entry.shift?.status) {
      case "Rejected":
        return <Badge variant="destructive" className="ml-2">Shift Rejected</Badge>;
      case "Approved":
        return <Badge variant="default" className="ml-2 bg-green-100 text-green-800">Shift Approved</Badge>;
      case "Pending Approval":
        return <Badge variant="outline" className="ml-2">Shift Pending</Badge>;
      default:
        return null;
    }
  };

  const getStatusMessage = (entry: CashEntry) => {
    if (entry.status === "Rejected" && entry.verificationNotes) {
      return `Rejected: ${entry.verificationNotes}`;
    }
    if (entry.status === "Verified" && entry.verificationNotes) {
      return `Verified: ${entry.verificationNotes}`;
    }
    
    // For pending entries, show shift status message
    switch (entry.shift?.status) {
      case "Rejected":
        return entry.shift.auditNotes 
          ? `Shift was rejected: ${entry.shift.auditNotes}`
          : "Associated shift was rejected, but cash needs separate verification";
      case "Approved":
        return "Associated shift was approved";
      case "Pending Approval":
        return "Associated shift is pending approval";
      default:
        return null;
    }
  };

  const getEntryColor = (entry: CashEntry) => {
    if (entry.status === "Rejected") {
      return "bg-red-50 border-red-200";
    }
    if (entry.status === "Verified") {
      return "bg-green-50 border-green-200";
    }
    if (entry.shift?.status === "Rejected") {
      return "bg-orange-50 border-orange-200";
    }
    return "bg-card";
  };

  const filteredEntries = showRejected 
    ? entries 
    : entries.filter(entry => entry.status === "Pending");

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
          <h3 className="text-lg font-semibold text-foreground">Cash & Expense Verification</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Verify cash collections, expenses, and bank deposits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRejected(!showRejected)}
          >
            {showRejected ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showRejected ? "Hide Rejected" : "Show Rejected"}
          </Button>
          <Button variant="outline" onClick={fetchPendingEntries}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p>No {showRejected ? "rejected" : "pending"} cash entries</p>
            <p className="text-sm mt-1">
              {showRejected 
                ? "All entries are pending or verified" 
                : "All entries have been processed"}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div 
              key={entry._id} 
              className={`p-4 border rounded-lg ${getEntryColor(entry)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Banknote className={`w-5 h-5 ${
                    entry.status === "Rejected" ? "text-red-600" :
                    entry.status === "Verified" ? "text-green-600" : "text-green-600"
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        Cash Collection
                      </p>
                      {getStatusBadge(entry)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Shift: {entry.shift?.shiftId} • {entry.nozzleman.name}
                      {entry.nozzleman.employeeId && ` (${entry.nozzleman.employeeId})`}
                    </p>
                    
                    {getStatusMessage(entry) && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className={`w-3 h-3 ${
                          entry.status === "Rejected" ? "text-red-600" :
                          entry.shift?.status === "Rejected" ? "text-orange-600" : "text-blue-600"
                        }`} />
                        <p className={`text-xs ${
                          entry.status === "Rejected" ? "text-red-600" :
                          entry.shift?.status === "Rejected" ? "text-orange-600" : "text-blue-600"
                        }`}>
                          {getStatusMessage(entry)}
                        </p>
                      </div>
                    )}

                    {entry.notes && !entry.verificationNotes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Notes: {entry.notes}
                      </p>
                    )}

                    {entry.verifiedBy && entry.verifiedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.status === "Verified" ? "Verified" : "Rejected"} by {entry.verifiedBy.name} on{" "}
                        {new Date(entry.verifiedAt).toLocaleDateString()} at{" "}
                        {new Date(entry.verifiedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-lg">
                    ₹{entry.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Action buttons only for pending entries */}
              {entry.status === "Pending" && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Status: </span>
                    <Badge variant="outline">Pending Verification</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyEntry(
                        entry._id, 
                        false, 
                        entry.shift?.status === "Rejected" 
                          ? "Cash rejected due to shift discrepancy" 
                          : "Cash verification failed"
                      )}
                      disabled={processingId === entry._id}
                    >
                      {processingId === entry._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleVerifyEntry(
                        entry._id, 
                        true,
                        entry.shift?.status === "Rejected"
                          ? "Cash verified despite shift rejection"
                          : "Cash verified successfully"
                      )}
                      disabled={processingId === entry._id}
                    >
                      {processingId === entry._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};