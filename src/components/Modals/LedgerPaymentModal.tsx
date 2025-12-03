// LedgerPaymentModal.tsx - FIXED WITH SAFE ACCESS
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  balance?: number;
  currentBalance?: number;
  creditLimit: number;
}

interface LedgerPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  customer: Customer | null;
  customers: Customer[];
}

export const LedgerPaymentModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  customer,
  customers 
}: LedgerPaymentModalProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (customer) {
        setSelectedCustomerId(customer._id);
        setFormData({
          amount: "",
          paymentDate: new Date().toISOString().split('T')[0],
          notes: `Payment from ${customer.name}`
        });
      } else if (customers.length > 0) {
        setSelectedCustomerId(customers[0]._id);
        setFormData({
          amount: "",
          paymentDate: new Date().toISOString().split('T')[0],
          notes: ""
        });
      }
    } else {
      setSelectedCustomerId("");
      setFormData({
        amount: "",
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ""
      });
      setLoading(false);
    }
  }, [open, customer, customers]);

  const selectedCustomer = customers.find(c => c._id === selectedCustomerId);

  // Safely get customer balance
  const getCustomerBalance = (customer: Customer | undefined): number => {
    if (!customer) return 0;
    return customer.balance || customer.currentBalance || 0;
  };

  // Safely format number for display
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return "0";
    return value.toLocaleString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    const paymentAmount = parseFloat(formData.amount);
    
    if (!formData.amount || isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount greater than zero",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        customerId: selectedCustomerId,
        amount: paymentAmount,
        paymentDate: formData.paymentDate,
        notes: formData.notes
      });
    } catch (error) {
      // Error is handled in parent
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    
    setFormData(prev => ({ ...prev, amount: numericValue }));
  };

  // Update notes when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        notes: prev.notes || `Payment from ${selectedCustomer.name}`
      }));
    }
  }, [selectedCustomer]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="payment-modal-description">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        {/* Accessibility description */}
        <div id="payment-modal-description" className="sr-only">
          Record a payment for the selected customer. Enter payment amount, date, and any notes.
        </div>

        {/* Customer Selection */}
        {customers.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor="customer-select">Select Customer *</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.name} ({customer.mobile}) - ₹{formatNumber(getCustomerBalance(customer))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Customer Info */}
        {selectedCustomer && (
          <div className="bg-muted p-3 rounded-md space-y-2">
            <h4 className="font-medium text-sm">Customer Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <div className="font-medium">{selectedCustomer.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mobile:</span>
                <div className="font-medium">{selectedCustomer.mobile}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Outstanding:</span>
                <div className={`font-medium ${getCustomerBalance(selectedCustomer) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{formatNumber(getCustomerBalance(selectedCustomer))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Credit Limit:</span>
                <div className="font-medium">₹{formatNumber(selectedCustomer.creditLimit)}</div>
              </div>
            </div>
          </div>
        )}

        {/* No Customers Message */}
        {customers.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
            <p className="text-yellow-800 text-sm">
              No customers available. Please add customers first.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Payment Amount (₹) *</Label>
            <Input
              id="amount"
              type="text"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              required
              disabled={!selectedCustomer || customers.length === 0 || loading}
            />
            {selectedCustomer && (
              <p className="text-xs text-muted-foreground mt-1">
                {getCustomerBalance(selectedCustomer) > 0 
                  ? `Outstanding balance: ₹${formatNumber(getCustomerBalance(selectedCustomer))}`
                  : 'No outstanding balance - recording advance payment'
                }
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
              disabled={!selectedCustomer || customers.length === 0 || loading}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment notes or reference"
              rows={3}
              disabled={!selectedCustomer || customers.length === 0 || loading}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.amount || !selectedCustomer || customers.length === 0}
            >
              {loading ? "Processing..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};