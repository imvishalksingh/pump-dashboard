// components/Tables/LedgerTable.tsx - FIXED VERSION
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface LedgerEntry {
  _id: string;
  customer?: {
    _id?: string;
    name?: string;
    mobile?: string;
  };
  type?: string;
  amount?: number;
  balance?: number;
  balanceAfter?: number;
  description?: string;
  reference?: string;
  transactionDate?: string;
  createdAt?: string;
}

interface LedgerTableProps {
  entries: LedgerEntry[];
  loading?: boolean;
}

export const LedgerTable = ({ entries, loading = false }: LedgerTableProps) => {
  // Safely format number
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "0.00";
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Safely get date
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm');
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Safely get customer name
  const getCustomerName = (customer: any): string => {
    if (!customer) return "Unknown Customer";
    return customer.name || "Unknown Customer";
  };

  const getTypeBadge = (type: string | undefined) => {
    if (!type) return null;

    const variants: Record<string, string> = {
      "Sale": "bg-blue-100 text-blue-800",
      "Payment": "bg-green-100 text-green-800",
      "Adjustment": "bg-yellow-100 text-yellow-800",
      "Credit Note": "bg-purple-100 text-purple-800",
      "Debit Note": "bg-orange-100 text-orange-800",
      "Interest": "bg-red-100 text-red-800",
      "Opening Balance": "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={`${variants[type] || 'bg-gray-100 text-gray-800'} font-normal`}>
        {type}
      </Badge>
    );
  };

  const getAmountColor = (type: string | undefined, amount: number | undefined) => {
    if (!type || !amount) return "";
    
    if (type === "Payment") return "text-green-600 font-medium";
    if (type === "Sale") return "text-red-600 font-medium";
    return "text-gray-700 font-medium";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading ledger entries...</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No ledger entries found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount (₹)</TableHead>
            <TableHead className="text-right">Balance (₹)</TableHead>
            <TableHead>Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const displayDate = formatDate(entry.transactionDate || entry.createdAt);
            const customerName = getCustomerName(entry.customer);
            const amount = entry.amount || 0;
            const balance = entry.balanceAfter || entry.balance || 0;
            
            return (
              <TableRow key={entry._id}>
                <TableCell className="whitespace-nowrap">
                  {displayDate}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{customerName}</div>
                  {entry.customer?.mobile && (
                    <div className="text-sm text-gray-500">{entry.customer.mobile}</div>
                  )}
                </TableCell>
                <TableCell>
                  {getTypeBadge(entry.type)}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate">
                    {entry.description || "No description"}
                  </div>
                </TableCell>
                <TableCell className={`text-right ${getAmountColor(entry.type, entry.amount)}`}>
                  {entry.type === "Payment" ? "+" : ""}₹{formatNumber(amount)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{formatNumber(balance)}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {entry.reference || "N/A"}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};