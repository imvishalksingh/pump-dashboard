import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { RealExpense } from "@/types/expense";

interface ExpenseTableProps {
  expenses: RealExpense[];
  onEdit: (expense: RealExpense) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean;
}

export const ExpenseTable = ({ 
  expenses, 
  onEdit, 
  onDelete, 
  onApprove,
  onReject,
  loading = false 
}: ExpenseTableProps) => {
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved": return "default";
      case "Pending": return "secondary";
      case "Rejected": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "text-green-600";
      case "Pending": return "text-amber-600";
      case "Rejected": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Loading expenses...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No expenses found. Add your first expense to get started.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  ₹{expense.amount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="capitalize">
                  {expense.addedBy || "Admin"}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={expense.description}>
                    {expense.description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(expense.status)} 
                    className={getStatusColor(expense.status)}
                  >
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    {/* Approve/Reject buttons for pending expenses */}
                    {expense.status === "Pending" && (
                      <>
                        {onApprove && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onApprove(expense._id)}
                            title="Approve expense"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {onReject && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onReject(expense._id)}
                            title="Reject expense"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    
                    {/* Edit button - available for all statuses */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onEdit(expense)}
                      title="Edit expense"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Delete button - available for all statuses */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDelete(expense._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};