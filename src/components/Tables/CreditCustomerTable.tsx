// components/Tables/CreditCustomerTable.tsx - FIXED
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CreditCard } from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  creditLimit: number;
  balance: number;
  address?: string;
  status: string;
}

interface CreditCustomerTableProps {
  customers: Customer[];
  onEdit: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onPayment: (customer: Customer) => void;
  loading?: boolean;
}

export const CreditCustomerTable = ({ 
  customers, 
  onEdit, 
  onDelete, 
  onPayment,
  loading = false 
}: CreditCustomerTableProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Suspended": return "secondary";
      case "Inactive": return "outline";
      default: return "outline";
    }
  };

  const getBalanceColor = (balance: number, creditLimit: number) => {
    if (balance === 0) return "text-green-600";
    if (balance > creditLimit * 0.8) return "text-red-600";
    return "text-amber-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Credit Limit</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Available Credit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No credit customers found. Add your first customer to get started.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const availableCredit = customer.creditLimit - customer.balance;
              
              return (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell>₹{customer.creditLimit.toLocaleString()}</TableCell>
                  <TableCell className={`font-semibold ${getBalanceColor(customer.balance, customer.creditLimit)}`}>
                    ₹{customer.balance.toLocaleString()}
                  </TableCell>
                  <TableCell className={availableCredit < 0 ? "text-red-600" : "text-green-600"}>
                    ₹{availableCredit.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onPayment(customer)}
                        title="Record payment"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onEdit(customer._id, customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onDelete(customer._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={customer.balance > 0}
                        title={customer.balance > 0 ? "Cannot delete customer with outstanding balance" : "Delete customer"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};