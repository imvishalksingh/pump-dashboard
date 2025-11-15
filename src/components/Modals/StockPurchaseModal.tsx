// components/Modals/StockPurchaseModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface StockPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseAdded: () => void;
}

export const StockPurchaseModal = ({ open, onOpenChange, onPurchaseAdded }: StockPurchaseModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Better initial state with proper empty values
const [formData, setFormData] = useState({
  product: "Petrol",
  openingStock: "",
  purchases: "",
  sales: "0", // Keep as string for input, but convert to number on submit
  capacity: "",
  rate: "",
  amount: "",
  supplier: "",
  invoiceNumber: ""
});

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Convert all numeric fields to numbers and validate
  const purchaseData = {
    product: formData.product,
    openingStock: parseFloat(formData.openingStock) || 0,
    purchases: parseFloat(formData.purchases) || 0,
    sales: parseFloat(formData.sales) || 0, // Ensure this is a number, not string
    capacity: parseFloat(formData.capacity) || 0,
    rate: parseFloat(formData.rate) || 0,
    amount: parseFloat(formData.amount) || 0,
    supplier: formData.supplier.trim(),
    invoiceNumber: formData.invoiceNumber.trim()
  };

  // Validate required fields - check if they have valid values
  const requiredFields = ['openingStock', 'purchases', 'capacity', 'rate', 'amount', 'supplier', 'invoiceNumber'];
  const missingFields = requiredFields.filter(field => {
    const value = purchaseData[field as keyof typeof purchaseData];
    return value === 0 || value === '' || !value;
  });
  
  if (missingFields.length > 0) {
    toast({
      title: "Missing fields",
      description: `Please fill in all required fields: ${missingFields.join(', ')}`,
      variant: "destructive",
    });
    return;
  }

  // Additional validation for negative numbers
  if (purchaseData.openingStock < 0 || purchaseData.purchases < 0 || purchaseData.capacity < 0 || 
      purchaseData.rate < 0 || purchaseData.amount < 0) {
    toast({
      title: "Invalid values",
      description: "Numeric values cannot be negative",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);

  try {
    console.log("Submitting purchase data:", purchaseData); // Debug log
    
    await api.post("/stock", purchaseData);

    toast({
      title: "Success",
      description: "Stock purchase recorded successfully",
    });

    // Reset form and close modal
    setFormData({
      product: "Petrol",
      openingStock: "",
      purchases: "",
      sales: "0",
      capacity: "",
      rate: "",
      amount: "",
      supplier: "",
      invoiceNumber: ""
    });
    onOpenChange(false);
    onPurchaseAdded();

  } catch (error: any) {
    console.error("Failed to record stock purchase:", error);
    console.log("Data that was sent:", purchaseData); // Debug log
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to record stock purchase",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate amount when rate or purchases change
  const calculateAmount = () => {
    const purchases = parseFloat(formData.purchases) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const amount = purchases * rate;
    
    if (!isNaN(amount)) {
      setFormData(prev => ({
        ...prev,
        amount: amount.toString()
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record Stock Purchase</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select value={formData.product} onValueChange={(value) => handleChange("product", value)}>
                <SelectTrigger id="product">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="CNG">CNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Tank Capacity (Liters) *</Label>
              <Input 
                id="capacity" 
                type="number"
                placeholder="5000"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingStock">Opening Stock (Liters) *</Label>
              <Input 
                id="openingStock" 
                type="number"
                placeholder="1000"
                value={formData.openingStock}
                onChange={(e) => handleChange("openingStock", e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchases">Purchase Quantity (Liters) *</Label>
              <Input 
                id="purchases" 
                type="number"
                placeholder="2000"
                value={formData.purchases}
                onChange={(e) => {
                  handleChange("purchases", e.target.value);
                  calculateAmount();
                }}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales">Sales (Liters)</Label>
              <Input 
                id="sales" 
                type="number"
                placeholder="0"
                value={formData.sales}
                onChange={(e) => handleChange("sales", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Rate per Liter (₹) *</Label>
              <Input 
                id="rate" 
                type="number"
                placeholder="95.50"
                value={formData.rate}
                onChange={(e) => {
                  handleChange("rate", e.target.value);
                  calculateAmount();
                }}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount (₹) *</Label>
              <Input 
                id="amount" 
                type="number"
                placeholder="191000"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input 
                id="supplier" 
                placeholder="Supplier name"
                value={formData.supplier}
                onChange={(e) => handleChange("supplier", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input 
                id="invoiceNumber" 
                placeholder="INV-2024-001"
                value={formData.invoiceNumber}
                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Purchase"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};