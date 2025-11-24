// components/Tables/FuelStockTable.tsx - FIXED WITH SAFE TYPE HANDLING
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RefreshCw, Download, Filter } from "lucide-react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface StockTransaction {
  _id: string;
  tank: string;
  tankName: string;
  product: string;
  transactionType: "purchase" | "sale" | "adjustment" | "delivery";
  quantity: number;
  previousStock: number;
  newStock: number;
  rate?: number;
  amount?: number;
  supplier?: string;
  invoiceNumber?: string;
  reason?: string;
  date: string;
  createdAt: string;
}

interface FuelStockTableProps {
  transactions?: StockTransaction[];
  onRefresh?: () => void;
}

export const FuelStockTable = ({ transactions: propTransactions, onRefresh }: FuelStockTableProps) => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const { toast } = useToast();

  // Fetch transactions if not provided via props
  useEffect(() => {
    if (!propTransactions) {
      fetchTransactions();
    } else {
      setTransactions(propTransactions);
      setLoading(false);
    }
  }, [propTransactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching stock transactions...");
      
      const response = await api.get("/api/stock/transactions");
      console.log("📊 Transactions response:", response.data);
      
      // Ensure we have an array and validate data
      const transactionsData = Array.isArray(response.data) ? response.data : [];
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error("❌ Failed to fetch transactions:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load stock transactions",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchTransactions();
    }
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  // Safe transaction type badge with fallback
  const getTransactionTypeBadge = (type: string | undefined) => {
    // Handle undefined or null types
    if (!type) {
      return <Badge className="bg-gray-100 text-gray-800">UNKNOWN</Badge>;
    }

    const typeLower = type.toLowerCase();
    const variants: Record<string, string> = {
      purchase: "bg-green-100 text-green-800",
      sale: "bg-blue-100 text-blue-800",
      adjustment: "bg-orange-100 text-orange-800",
      delivery: "bg-purple-100 text-purple-800"
    };

    const variantClass = variants[typeLower] || "bg-gray-100 text-gray-800";
    
    return (
      <Badge className={variantClass}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  // Safe quantity display
  const getQuantityDisplay = (transaction: StockTransaction) => {
    const type = transaction.transactionType?.toLowerCase() || '';
    const quantity = Math.abs(transaction.quantity || 0);
    
    if (type === 'purchase' || type === 'delivery') {
      return `+${quantity.toLocaleString()} L`;
    } else {
      return `-${quantity.toLocaleString()} L`;
    }
  };

  // Safe date formatting
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Safe number formatting
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString();
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.tankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesType = 
      transactionTypeFilter === "all" || 
      transaction.transactionType === transactionTypeFilter;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Stock Transaction History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete history of all stock movements across tanks
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tank, product, invoice, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tank</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Stock Before</TableHead>
                <TableHead>Stock After</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Invoice/Ref</TableHead>
                <TableHead>Supplier/Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    {transactions.length === 0 ? "No transactions found" : "No transactions match your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.tankName || "Unknown Tank"}
                    </TableCell>
                    <TableCell>{transaction.product || "Unknown"}</TableCell>
                    <TableCell>
                      {getTransactionTypeBadge(transaction.transactionType)}
                    </TableCell>
                    <TableCell className={`font-semibold ${
                      (transaction.transactionType?.toLowerCase() === 'purchase' || 
                       transaction.transactionType?.toLowerCase() === 'delivery') 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getQuantityDisplay(transaction)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(transaction.previousStock)} L
                    </TableCell>
                    <TableCell>
                      {formatNumber(transaction.newStock)} L
                    </TableCell>
                    <TableCell>
                      {transaction.rate ? `₹${transaction.rate}` : '-'}
                    </TableCell>
                    <TableCell>
                      {transaction.amount ? `₹${formatNumber(transaction.amount)}` : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.invoiceNumber || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.supplier || transaction.reason || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        )}
      </CardContent>
    </Card>
  );
};