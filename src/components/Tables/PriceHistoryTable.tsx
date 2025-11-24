import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { PriceHistory } from "@/types/product";

interface PriceHistoryTableProps {
  history: PriceHistory[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const PriceHistoryTable = ({ history, onApprove, onReject }: PriceHistoryTableProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriceChangeColor = (oldPrice: number, newPrice: number) => {
    return newPrice > oldPrice ? "text-red-600" : "text-green-600";
  };

  const getPriceChangeIcon = (oldPrice: number, newPrice: number) => {
    return newPrice > oldPrice ? "↗" : "↘";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Old Price</TableHead>
            <TableHead>New Price</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Updated By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No price history found
              </TableCell>
            </TableRow>
          ) : (
            history.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell className="text-muted-foreground">₹{item.oldPrice.toFixed(2)}</TableCell>
                <TableCell className="font-semibold">₹{item.newPrice.toFixed(2)}</TableCell>
                <TableCell className={`font-medium ${getPriceChangeColor(item.oldPrice, item.newPrice)}`}>
                  {getPriceChangeIcon(item.oldPrice, item.newPrice)} 
                  ₹{Math.abs(item.newPrice - item.oldPrice).toFixed(2)}
                </TableCell>
                <TableCell>{item.updatedBy}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {item.status === "Pending" && (
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={() => onApprove(item._id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onReject(item._id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};