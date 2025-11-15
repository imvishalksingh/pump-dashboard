// components/Audit/SalesRecordsAudit.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Search, Calculator, Car, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface SalesTransaction {
  _id: string;
  transactionId: string;
  fuelType: string;
  fuelQuantity: number;
  rate: number;
  amount: number;
  vehicle: {
    number: string;
    type: string;
  };
  nozzle: {
    name: string;
    fuelType: string;
    rate: number;
  };
  shift: {
    shiftId: string;
    nozzleman: {
      name: string;
    };
  };
  auditStatus: "Pending" | "Approved" | "Rejected";
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
      // Mock data for now
      const mockData: SalesTransaction[] = [
        {
          _id: "1",
          transactionId: "TXN-001",
          fuelType: "Petrol",
          fuelQuantity: 25,
          rate: 95,
          amount: 2375,
          vehicle: { number: "ABC123", type: "Car" },
          nozzle: { name: "Nozzle 1", fuelType: "Petrol", rate: 95 },
          shift: { shiftId: "SH-001", nozzleman: { name: "Rajesh Kumar" } },
          auditStatus: "Pending",
          createdAt: new Date().toISOString()
        }
      ];
      setSalesTransactions(mockData);
    } catch (error: any) {
      console.error("Failed to fetch sales transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load sales records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTransaction = async (transactionId: string, approved: boolean, notes?: string) => {
    try {
      setProcessingId(transactionId);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: approved ? "Transaction Approved" : "Transaction Rejected",
        description: `Sales transaction has been ${approved ? "approved" : "rejected"}`,
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
    transaction.vehicle.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.fuelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.shift.shiftId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Verify sales transactions for accuracy and proper pricing
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
          placeholder="Search by transaction ID, vehicle, fuel type..."
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
            const expectedAmount = transaction.fuelQuantity * transaction.rate;
            const amountDifference = transaction.amount - expectedAmount;
            const hasDiscrepancy = Math.abs(amountDifference) > 1;

            return (
              <div key={transaction._id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-foreground">
                        Transaction: {transaction.transactionId}
                      </p>
                      <Badge variant="outline">{transaction.fuelType}</Badge>
                      {hasDiscrepancy && (
                        <Badge variant="destructive">Amount Mismatch</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        {transaction.vehicle.number} ({transaction.vehicle.type})
                      </div>
                      <div>
                        Shift: {transaction.shift.shiftId}
                      </div>
                      <div>
                        Nozzleman: {transaction.shift.nozzleman.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-muted-foreground">Fuel Quantity</p>
                    <p className="font-semibold text-foreground">
                      {transaction.fuelQuantity} L
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-muted-foreground">Rate</p>
                    <p className="font-semibold text-foreground">
                      ₹{transaction.rate}/L
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-muted-foreground">Charged Amount</p>
                    <p className="font-semibold text-foreground">
                      ₹{transaction.amount.toLocaleString()}
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
                      Expected: ₹{expectedAmount} • Charged: ₹{transaction.amount}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calculator className="w-4 h-4" />
                    <span>
                      Formula: {transaction.fuelQuantity}L × ₹{transaction.rate} = ₹{expectedAmount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDiscrepancy && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyTransaction(
                          transaction._id, 
                          false, 
                          `Amount discrepancy. Expected: ₹${expectedAmount}, Charged: ₹${transaction.amount}`
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
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleVerifyTransaction(transaction._id, true)}
                      disabled={processingId === transaction._id}
                    >
                      {processingId === transaction._id ? (
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