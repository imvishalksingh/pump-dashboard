// components/Tables/CreditCustomerTable.tsx - FIXED VERSION
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  creditLimit: number;
  balance?: number;
  currentBalance?: number;
  address?: string;
  status: string;
  createdAt: string;
}

interface CreditCustomerTableProps {
  customers: Customer[];
  onEdit: (customerId: string, customerData: any) => void;
  onDelete: (customerId: string) => void;
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
  const [editingId, setEditingId] = useState<string | null>(null);

  // Safely get customer balance
  const getCustomerBalance = (customer: Customer): number => {
    return customer.balance || customer.currentBalance || 0;
  };

  // Safely format number
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return "0";
    return value.toLocaleString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Active": "bg-green-100 text-green-800",
      "Suspended": "bg-yellow-100 text-yellow-800",
      "Blocked": "bg-red-100 text-red-800",
      "Inactive": "bg-gray-100 text-gray-800",
      "Under Review": "bg-blue-100 text-blue-800"
    };

    return (
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'} font-normal`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading customers...</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No customers found. Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Credit Limit</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Available Credit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const balance = getCustomerBalance(customer);
            const creditLimit = customer.creditLimit || 0;
            const availableCredit = Math.max(0, creditLimit - balance);
            
            return (
              <TableRow key={customer._id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{customer.name}</div>
                    {customer.email && (
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{customer.mobile}</TableCell>
                <TableCell className="font-medium">
                  ₹{formatNumber(creditLimit)}
                </TableCell>
                <TableCell>
                  <div className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{formatNumber(balance)}
                  </div>
                  {balance > 0 && (
                    <div className="text-xs text-gray-500">
                      Outstanding
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    ₹{formatNumber(availableCredit)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {creditLimit > 0 ? `${Math.round((availableCredit / creditLimit) * 100)}% available` : 'No limit'}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(customer.status)}</TableCell>
                <TableCell>
                  {format(new Date(customer.createdAt), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPayment(customer)}
                      title="Record Payment"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Payment
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(customer._id, customer)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(customer._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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