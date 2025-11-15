// components/Tables/LedgerTable.tsx - UPDATED
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LedgerEntry } from "@/types/ledger";

interface LedgerTableProps {
  entries: LedgerEntry[];
  loading?: boolean;
}

export const LedgerTable = ({ entries, loading = false }: LedgerTableProps) => {
  const getTypeVariant = (type: string) => {
    switch (type) {
      case "Payment": return "default";
      case "Sale": return "secondary";
      case "Adjustment": return "outline";
      default: return "outline";
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === "Payment") return "text-green-600";
    return "text-blue-600";
  };

  const getAmountPrefix = (type: string) => {
    return type === "Payment" ? "-" : "+";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Loading ledger entries...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No ledger entries found. Record payments or sales to see entries here.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>
                  {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  {entry.customer?.name || entry.customerName || 'Unknown'}
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeVariant(entry.type)}>
                    {entry.type}
                  </Badge>
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className={`font-semibold ${getAmountColor(entry.type, entry.amount)}`}>
                  {getAmountPrefix(entry.type)}₹{Math.abs(entry.amount).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  ₹{entry.balance.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.reference || '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};