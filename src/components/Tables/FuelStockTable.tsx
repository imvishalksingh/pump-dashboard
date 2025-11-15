// components/Tables/FuelStockTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface FuelStock {
  _id: string;
  product: string;
  openingStock: number;
  purchases: number;
  sales: number;
  closingStock: number;
  capacity: number;
  currentLevel: number;
  alert: boolean;
  rate: number;
  amount: number;
  supplier: string;
  invoiceNumber: string;
  date: string;
}

interface FuelStockTableProps {
  stocks: FuelStock[];
  onRefresh: () => void;
}

export const FuelStockTable = ({ stocks, onRefresh }: FuelStockTableProps) => {
  const { toast } = useToast();

  const deleteStockEntry = async (stockId: string) => {
    if (!confirm("Are you sure you want to delete this stock entry?")) {
      return;
    }

    try {
      await api.delete(`/stock/${stockId}`);
      toast({
        title: "Success",
        description: "Stock entry deleted successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete stock entry",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (alert: boolean) => {
    return alert ? "destructive" : "default";
  };

  const getTransactionType = (stock: FuelStock) => {
    if (stock.supplier === "System Adjustment") {
      if (stock.purchases > 0) return "Stock Addition";
      if (stock.sales > 0) return "Stock Deduction";
      return "Stock Adjustment";
    }
    if (stock.purchases > 0 && stock.sales === 0) return "Purchase";
    if (stock.sales > 0 && stock.purchases === 0) return "Sale";
    return "Transaction";
  };

  const getTransactionIcon = (stock: FuelStock) => {
    if (stock.supplier === "System Adjustment") {
      if (stock.purchases > 0) return <Plus className="h-3 w-3 text-green-600" />;
      if (stock.sales > 0) return <Minus className="h-3 w-3 text-red-600" />;
      return <Settings className="h-3 w-3 text-blue-600" />;
    }
    if (stock.purchases > 0) return <Plus className="h-3 w-3 text-green-600" />;
    return <Minus className="h-3 w-3 text-orange-600" />;
  };

  const getTransactionBadge = (stock: FuelStock) => {
    const type = getTransactionType(stock);
    
    switch (type) {
      case "Purchase":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Purchase</Badge>;
      case "Sale":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Sale</Badge>;
      case "Stock Addition":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Stock Added</Badge>;
      case "Stock Deduction":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Stock Deducted</Badge>;
      case "Stock Adjustment":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Calibration</Badge>;
      default:
        return <Badge variant="outline">Transaction</Badge>;
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Opening Stock</TableHead>
            <TableHead>Purchases</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead>Closing Stock</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Supplier/Reason</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                No stock entries found. Record your first purchase to get started.
              </TableCell>
            </TableRow>
          ) : (
            stocks.map((stock) => (
              <TableRow key={stock._id} className={
                stock.supplier === "System Adjustment" 
                  ? "bg-blue-50 hover:bg-blue-100" 
                  : "hover:bg-muted/50"
              }>
                <TableCell className="font-medium">
                  {new Date(stock.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(stock)}
                    {getTransactionBadge(stock)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{stock.product}</TableCell>
                <TableCell>{stock.openingStock.toLocaleString()} L</TableCell>
                <TableCell>
                  <span className={
                    stock.purchases > 0 
                      ? stock.supplier === "System Adjustment" 
                        ? "text-blue-600 font-medium" 
                        : "text-green-600 font-medium"
                      : ""
                  }>
                    {stock.purchases.toLocaleString()} L
                  </span>
                </TableCell>
                <TableCell>
                  <span className={
                    stock.sales > 0 
                      ? stock.supplier === "System Adjustment" 
                        ? "text-red-600 font-medium" 
                        : "text-orange-600 font-medium"
                      : ""
                  }>
                    {stock.sales.toLocaleString()} L
                  </span>
                </TableCell>
                <TableCell className="font-semibold">
                  {stock.closingStock.toLocaleString()} L
                </TableCell>
                <TableCell>{stock.capacity.toLocaleString()} L</TableCell>
                <TableCell>
                  <span className={
                    stock.currentLevel > 100 
                      ? "text-red-600 font-medium" 
                      : stock.currentLevel <= 20 
                        ? "text-orange-600 font-medium" 
                        : "text-green-600 font-medium"
                  }>
                    {stock.currentLevel}%
                  </span>
                </TableCell>
                <TableCell>
                  {stock.rate > 0 ? `₹${stock.rate}/L` : "-"}
                </TableCell>
                <TableCell>
                  {stock.amount > 0 ? `₹${stock.amount.toLocaleString()}` : "-"}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {stock.supplier}
                </TableCell>
                <TableCell className="max-w-[120px] truncate">
                  {stock.invoiceNumber}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(stock.alert)}>
                    {stock.alert ? "Low Stock" : "Normal"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteStockEntry(stock._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={stock.supplier === "System Adjustment"}
                    title={
                      stock.supplier === "System Adjustment" 
                        ? "Adjustment entries cannot be deleted" 
                        : "Delete entry"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
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