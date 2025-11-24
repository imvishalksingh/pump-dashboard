// components/Audit/FuelStockAudit.tsx - FIXED WITH NULL CHECKS
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Calculator, Droplet, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface StockDiscrepancy {
  product: string;
  expectedClosing: number;
  actualClosing: number;
  difference: number;
  severity: "High" | "Medium";
  stockEntry: {
    openingStock: number;
    purchases: number;
    sales: number;
    closingStock: number;
    capacity: number;
    currentLevel: number;
  };
}

interface PendingAdjustment {
  _id: string;
  product: string;
  adjustmentType: "addition" | "deduction" | "calibration";
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  adjustedBy: {
    name: string;
  };
  createdAt: string;
  status: "Pending";
}

interface FuelStockAuditData {
  calculationDiscrepancies: StockDiscrepancy[];
  pendingAdjustments: PendingAdjustment[];
}

interface FuelStockAuditProps {
  onUpdate: () => void;
}

// Safe number formatter with fallback
const formatNumber = (value: number | undefined | null, fallback: string = "N/A"): string => {
  if (value === undefined || value === null) return fallback;
  return value.toLocaleString();
};

// Safe percentage calculator
const calculatePercentage = (part: number | undefined, total: number | undefined): number => {
  if (!part || !total || total === 0) return 0;
  return Math.round((part / total) * 100);
};

export const FuelStockAudit = ({ onUpdate }: FuelStockAuditProps) => {
  const [auditData, setAuditData] = useState<FuelStockAuditData>({
    calculationDiscrepancies: [],
    pendingAdjustments: []
  });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStockAuditData();
  }, []);

  const fetchStockAuditData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching stock audit data...");
      
      const response = await api.get("/api/audit/stock/discrepancies");
      console.log("📊 Stock audit response:", response.data);
      
      // Validate and sanitize data
      const validatedData = {
        calculationDiscrepancies: (response.data.calculationDiscrepancies || []).map((item: any) => ({
          ...item,
          expectedClosing: item.expectedClosing || 0,
          actualClosing: item.actualClosing || 0,
          difference: item.difference || 0,
          stockEntry: {
            openingStock: item.stockEntry?.openingStock || 0,
            purchases: item.stockEntry?.purchases || 0,
            sales: item.stockEntry?.sales || 0,
            closingStock: item.stockEntry?.closingStock || 0,
            capacity: item.stockEntry?.capacity || 0,
            currentLevel: item.stockEntry?.currentLevel || 0,
          }
        })),
        pendingAdjustments: (response.data.pendingAdjustments || []).map((item: any) => ({
          ...item,
          quantity: item.quantity || 0,
          previousStock: item.previousStock || 0,
          newStock: item.newStock || 0,
          adjustedBy: {
            name: item.adjustedBy?.name || "Unknown User"
          }
        }))
      };
      
      setAuditData(validatedData);
    } catch (error: any) {
      console.error("Failed to fetch stock audit data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load fuel stock audit data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

 // In FuelStockAudit.tsx - update the handleApproveAdjustment function
const handleApproveAdjustment = async (adjustmentId: string, approved: boolean, notes?: string) => {
  try {
    setProcessingId(adjustmentId);
    console.log(`🔄 ${approved ? 'Approving' : 'Rejecting'} stock adjustment:`, adjustmentId);
    
    const response = await api.post(`/api/audit/stock/adjustments/${adjustmentId}/approve`, {
      approved,
      notes: notes || (approved ? "Stock adjustment approved" : "Stock adjustment rejected")
    });
    
    console.log("✅ Stock adjustment response:", response.data);
    
    toast({
      title: approved ? "Adjustment Approved" : "Adjustment Rejected",
      description: response.data.message,
    });
    
    fetchStockAuditData();
    onUpdate();
  } catch (error: any) {
    console.error("Failed to process adjustment:", error);
    
    // More specific error handling
    const errorMessage = error.response?.data?.message || "Failed to process adjustment";
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Refresh data to get current status
    fetchStockAuditData();
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
    <div className="space-y-6">
      {/* Stock Calculation Discrepancies */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Stock Calculation Verification
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Verify fuel stock calculations and identify discrepancies
            </p>
          </div>
          <Button variant="outline" onClick={fetchStockAuditData}>
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {auditData.calculationDiscrepancies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p>No stock calculation discrepancies found</p>
              <p className="text-sm mt-1">All stock calculations are accurate</p>
            </div>
          ) : (
            auditData.calculationDiscrepancies.map((discrepancy, index) => (
              <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-foreground">{discrepancy.product}</p>
                      <Badge variant="destructive" className="mt-1">
                        {discrepancy.severity} Severity
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {discrepancy.difference > 0 ? "+" : ""}{formatNumber(discrepancy.difference)} L
                    </p>
                    <p className="text-sm text-muted-foreground">Discrepancy</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-muted-foreground">Expected Closing</p>
                    <p className="font-semibold text-foreground">
                      {formatNumber(discrepancy.expectedClosing)} L
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculatePercentage(discrepancy.expectedClosing, discrepancy.stockEntry.capacity)}% capacity
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-muted-foreground">Actual Closing</p>
                    <p className="font-semibold text-foreground">
                      {formatNumber(discrepancy.actualClosing)} L
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(discrepancy.stockEntry.currentLevel)}% capacity
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-muted-foreground">Variance</p>
                    <p className={`font-semibold ${
                      Math.abs(discrepancy.difference) > 100 ? "text-red-600" : "text-orange-600"
                    }`}>
                      {formatNumber(Math.abs(discrepancy.difference))} L
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.abs(discrepancy.difference) > 100 ? "Major issue" : "Minor variance"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Opening:</span> {formatNumber(discrepancy.stockEntry.openingStock)}L
                  </div>
                  <div>
                    <span className="font-medium">Purchases:</span> +{formatNumber(discrepancy.stockEntry.purchases)}L
                  </div>
                  <div>
                    <span className="font-medium">Sales:</span> -{formatNumber(discrepancy.stockEntry.sales)}L
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Pending Stock Adjustments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Droplet className="w-5 h-5 text-orange-600" />
              Pending Stock Adjustments
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve manual stock adjustments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              {auditData.pendingAdjustments.length} Pending
            </Badge>
            <Button variant="outline" onClick={fetchStockAuditData}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {auditData.pendingAdjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p>No pending stock adjustments</p>
              <p className="text-sm mt-1">All adjustments have been processed</p>
            </div>
          ) : (
            auditData.pendingAdjustments.map((adjustment) => (
              <div key={adjustment._id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-foreground">{adjustment.product}</p>
                      <Badge variant="outline" className={
                        adjustment.adjustmentType === "addition" ? "bg-green-100 text-green-800" :
                        adjustment.adjustmentType === "deduction" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }>
                        {adjustment.adjustmentType.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reason: {adjustment.reason}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adjusted by {adjustment.adjustedBy.name} •{" "}
                      {new Date(adjustment.createdAt).toLocaleDateString()} at{" "}
                      {new Date(adjustment.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">Previous Stock</p>
                    <p className="font-semibold text-foreground">
                      {formatNumber(adjustment.previousStock)} L
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">Adjustment</p>
                    <p className={`font-semibold ${
                      adjustment.adjustmentType === "addition" ? "text-green-600" : "text-red-600"
                    }`}>
                      {adjustment.adjustmentType === "addition" ? "+" : "-"}{formatNumber(adjustment.quantity)} L
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">New Stock</p>
                    <p className="font-semibold text-foreground">
                      {formatNumber(adjustment.newStock)} L
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-semibold text-foreground capitalize">
                      {adjustment.adjustmentType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Stock change: {formatNumber(adjustment.previousStock)}L → {formatNumber(adjustment.newStock)}L
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveAdjustment(
                        adjustment._id, 
                        false, 
                        "Adjustment not justified or documentation insufficient"
                      )}
                      disabled={processingId === adjustment._id}
                    >
                      {processingId === adjustment._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproveAdjustment(adjustment._id, true)}
                      disabled={processingId === adjustment._id}
                    >
                      {processingId === adjustment._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};