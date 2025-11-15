import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, TrendingUp } from "lucide-react";

interface CreditSummaryCardProps {
  totalCustomers: number;
  outstandingCredit: number;
  paymentsDue: number;
}

export const CreditSummaryCard = ({ 
  totalCustomers, 
  outstandingCredit, 
  paymentsDue 
}: CreditSummaryCardProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">Active credit accounts</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Credit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{outstandingCredit.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total receivables</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payments Due</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paymentsDue}</div>
          <p className="text-xs text-muted-foreground">Pending collections</p>
        </CardContent>
      </Card>
    </div>
  );
};
