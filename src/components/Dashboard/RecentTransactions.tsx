// components/Dashboard/RecentTransactions.tsx - UPDATED
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      // Use the same API endpoint as your Sales Management page
      const response = await api.get("/sales");
      console.log("All sales response:", response.data);
      
      // Get only the latest 5 transactions, sorted by creation date
      const recentTransactions = response.data
        .sort((a: Transaction, b: Transaction) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      
      console.log("Recent transactions:", recentTransactions);
      setTransactions(recentTransactions);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load recent transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentBadge = (mode: string) => {
    const variants: Record<string, any> = {
      Cash: "default",
      UPI: "secondary",
      Card: "outline",
      Credit: "outline",
    };
    return variants[mode] || "outline";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest 5 sales</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading transactions...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest 5 sales</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Transaction ID</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Product</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Liters</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Payment</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Nozzle</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No recent transactions found
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-primary">{txn.transactionId}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{txn.nozzle?.fuelType || 'Unknown'}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{txn.liters} L</td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">₹{txn.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getPaymentBadge(txn.paymentMode)}>{txn.paymentMode}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {txn.nozzle?.number || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDateTime(txn.createdAt)}
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