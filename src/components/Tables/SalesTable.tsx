// components/Tables/SalesTable.tsx - UPDATED FOR REAL DATA
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface Sale {
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

interface SalesTableProps {
  sales: Sale[];
}

export const SalesTable = ({ sales }: SalesTableProps) => {
  const getPaymentBadge = (mode: string) => {
    const variants: Record<string, any> = {
      Cash: "default",
      UPI: "secondary",
      Card: "outline",
      Credit: "outline",
    };
    return variants[mode] || "outline";
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date/Time</TableHead>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Nozzle</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price/L</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No sales transactions found. Verify cash handovers to create sales records.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale._id}>
                <TableCell className="font-medium">{sale.transactionId}</TableCell>
                <TableCell>
                  {new Date(sale.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>{sale.nozzle?.fuelType || 'Unknown'}</TableCell>
                <TableCell>{sale.nozzle?.number || 'Unknown'}</TableCell>
                <TableCell>{sale.liters} L</TableCell>
                <TableCell>₹{sale.price.toFixed(2)}</TableCell>
                <TableCell className="font-semibold">₹{sale.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={getPaymentBadge(sale.paymentMode)}>{sale.paymentMode}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Printer className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};