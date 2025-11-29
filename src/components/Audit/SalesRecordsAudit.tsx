// components/Audit/SalesRecordsAudit.tsx - UPDATED
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Search, Calculator, Car, Loader2, Fuel, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface SalesTransaction {
  _id: string;
  transactionId: string;
  fuelType: string;
  liters: number;
  price: number;
  totalAmount: number;
  paymentMode: string;
  nozzle: {
    _id: string;
    number: string;
    fuelType: string;
  };
  shift?: {
    shiftId: string;
    nozzleman: {
      name: string;
    };
  };
  verifiedBy?: {
    name: string;
  };
  tankDeducted?: boolean;
  tankReference?: string;
  createdAt: string;
}

interface SalesRecordsAuditProps {
  onUpdate: () => void;
}

export const SalesRecordsAudit = ({ onUpdate }: SalesRecordsAuditProps) => {
  const [salesTransactions, setSalesTransactions] = useState<SalesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingSales();
  }, []);

  const fetchPendingSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/audit/sales/pending");
      console.log("📊 Sales transactions:", response.data);
      setSalesTransactions(response.data);
    } catch (error: any) {
      console.error("Failed to fetch sales transactions:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load sales records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTransaction = async (transactionId: string, approved: boolean, notes?: string) => {
    try {
      setProcessingId(transactionId);
      
      const response = await api.post(`/api/audit/sales/${transactionId}/verify`, {
        approved,
        notes
      });
      
      toast({
        title: approved ? "Transaction Approved" : "Transaction Rejected",
        description: `Sales transaction has been ${approved ? "verified and tank deducted" : "rejected"}`,
      });
      
      fetchPendingSales();
      onUpdate();
    } catch (error: any) {
      console.error("Failed to verify transaction:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify transaction",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTransactions = salesTransactions.filter(transaction =>
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.fuelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.shift?.shiftId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFuelColor = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'petrol': return 'bg-green-100 text-green-800';
      case 'diesel': return 'bg-blue-100 text-blue-800';
      case 'cng': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h3 className="text-lg font-semibold text-foreground">Sales Records Audit</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Verify sales transactions - Tank will be automatically deducted upon approval
          </p>
        </div>
        <Button variant="outline" onClick={fetchPendingSales}>
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by transaction ID, fuel type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p>No pending sales transactions for audit</p>
            <p className="text-sm mt-1">All sales records have been verified</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const expectedAmount = transaction.liters * transaction.price;
            const amountDifference = transaction.totalAmount - expectedAmount;
            const hasDiscrepancy = Math.abs(amountDifference) > 1;

            return (
              <div key={transaction._id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-foreground">
                        {transaction.transactionId}
                      </p>
                      <Badge className={getFuelColor(transaction.fuelType)}>
                        <Fuel className="w-3 h-3 mr-1" />
                        {transaction.fuelType}
                      </Badge>
                      <Badge variant="outline">
                        {transaction.paymentMode}
                      </Badge>
                      {hasDiscrepancy && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Amount Mismatch
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        Nozzle: {transaction.nozzle.number}
                      </div>
                      {transaction.shift && (
                        <>
                          <div>Shift: {transaction.shift.shiftId}</div>
                          <div>Nozzleman: {transaction.shift.nozzleman.name}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ₹{transaction.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-muted-foreground">Fuel Quantity</p>
                    <p className="font-semibold text-foreground">
                      {transaction.liters} L
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-muted-foreground">Rate</p>
                    <p className="font-semibold text-foreground">
                      ₹{transaction.price}/L
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-muted-foreground">Charged Amount</p>
                    <p className="font-semibold text-foreground">
                      ₹{transaction.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-muted-foreground">Expected Amount</p>
                    <p className="font-semibold text-foreground">
                      ₹{expectedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {hasDiscrepancy && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Amount discrepancy detected
                        </span>
                      </div>
                      <span className={`font-semibold ${
                        amountDifference > 0 ? "text-red-600" : "text-orange-600"
                      }`}>
                        {amountDifference > 0 ? "+" : ""}₹{Math.abs(amountDifference)}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Expected: ₹{expectedAmount} • Charged: ₹{transaction.totalAmount}
                    </p>
                  </div>
                )}

                {/* TANK DEDUCTION INFO */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Tank Deduction Notice
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Approving this transaction will automatically deduct {transaction.liters}L of {transaction.fuelType} from the corresponding tank stock.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calculator className="w-4 h-4" />
                    <span>
                      Formula: {transaction.liters}L × ₹{transaction.price} = ₹{expectedAmount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyTransaction(
                        transaction._id, 
                        false, 
                        hasDiscrepancy 
                          ? `Amount discrepancy. Expected: ₹${expectedAmount}, Charged: ₹${transaction.totalAmount}`
                          : "Transaction rejected by auditor"
                      )}
                      disabled={processingId === transaction._id}
                    >
                      {processingId === transaction._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleVerifyTransaction(
                        transaction._id, 
                        true,
                        hasDiscrepancy
                          ? `Transaction approved despite amount discrepancy. Tank deducted: ${transaction.liters}L`
                          : `Transaction verified. Tank deducted: ${transaction.liters}L`
                      )}
                      disabled={processingId === transaction._id}
                    >
                      {processingId === transaction._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      {hasDiscrepancy ? "Approve & Deduct" : "Verify & Deduct"}
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