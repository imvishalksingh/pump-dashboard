// components/Dashboard/RecentTransactions.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  _id: string;
  transactionId: string;
  liters: number;
  price: number;
  totalAmount: number;
  paymentMode: string;
  nozzle?: {
    number: string;
    fuelType: string;
  };
  createdAt: string;
}

interface Shift {
  _id: string;
  shiftId: string;
  startTime: string;
  endTime: string;
  cashCollected: number;
  phonePeSales: number;
  posSales: number;
  creditSales: number;
  fuelDispensed: number;
  status: string;
  nozzle?: {
    number: string;
    fuelType: string;
  };
  isManualEntry: boolean;
}

export const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      console.log("🔄 Fetching recent transactions from nozzleman-sales...");
      
      // Get date range for last 7 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await api.get(`/api/nozzleman-sales?startDate=${startDate}&endDate=${endDate}`);
      const nozzlemanData = response.data.data || [];
      
      console.log(`📈 Found ${nozzlemanData.length} nozzlemen with data`);

      // Extract and flatten all shifts from all nozzlemen
      const allShifts: Shift[] = [];
      nozzlemanData.forEach((nozzleman: any) => {
        if (nozzleman.shifts && nozzleman.shifts.length > 0) {
          allShifts.push(...nozzleman.shifts);
        }
      });

      console.log(`📊 Total shifts found: ${allShifts.length}`);

      // Convert shifts to transaction format and get latest 5
      const recentTransactions = allShifts
        .filter((shift: Shift) => shift.fuelDispensed > 0)
        .sort((a: Shift, b: Shift) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
        .slice(0, 5)
        .map((shift: Shift) => ({
          _id: shift._id,
          transactionId: shift.shiftId,
          liters: shift.fuelDispensed,
          price: 0, // Calculate average price if needed
          totalAmount: shift.cashCollected + shift.phonePeSales + shift.posSales + shift.creditSales,
          paymentMode: getPaymentMode(shift),
          nozzle: shift.nozzle,
          createdAt: shift.startTime
        }));

      console.log("✅ Recent transactions:", recentTransactions);
      setTransactions(recentTransactions);
    } catch (error: any) {
      console.error("❌ Failed to fetch transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load recent transactions",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMode = (shift: Shift): string => {
    const payments = [
      { mode: 'Cash', amount: shift.cashCollected },
      { mode: 'UPI', amount: shift.phonePeSales },
      { mode: 'Card', amount: shift.posSales },
      { mode: 'Credit', amount: shift.creditSales }
    ];
    
    const maxPayment = payments.reduce((max, payment) => 
      payment.amount > max.amount ? payment : max
    );
    
    return maxPayment.mode;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentBadge = (mode: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      Cash: "default",
      UPI: "secondary",
      Card: "outline",
      Credit: "outline",
    };
    return variants[mode] || "outline";
  };

  // Loading state remains the same...
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between p-3 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                <div className="h-6 bg-muted rounded w-16 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <a href="/sales" className="flex items-center gap-1 text-sm text-primary hover:underline">
          View All <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          transactions.map((txn) => (
            <div key={txn._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <span className="text-sm font-medium">{txn.nozzle?.fuelType?.charAt(0) || 'F'}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{txn.transactionId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {txn.nozzle?.fuelType || 'Unknown'} • {txn.liters}L
                    </span>
                    <Badge variant={getPaymentBadge(txn.paymentMode)} className="text-xs">
                      {txn.paymentMode}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-foreground">₹{txn.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatTime(txn.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};