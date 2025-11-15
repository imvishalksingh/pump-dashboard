// components/Stock/StockAdjustment.tsx - UPDATED VERSION
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface StockAdjustmentProps {
  onAdjustmentAdded: () => void;
}

export const StockAdjustment = ({ onAdjustmentAdded }: StockAdjustmentProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    product: "",
    adjustmentType: "",
    quantity: "",
    reason: "",
    customReason: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.product || !formData.adjustmentType || !formData.quantity || !formData.reason) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Use custom reason if "Other" is selected
    const finalReason = formData.reason === "Other" 
      ? (formData.customReason || "Other adjustment")
      : formData.reason;

    if (formData.reason === "Other" && !formData.customReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide details for the adjustment reason",
        variant: "destructive",
      });
      return;
    }

    // Validate quantity
    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid positive quantity",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("📝 Submitting stock adjustment for approval...");
      
      const response = await api.post("/stock/adjustment", {
        product: formData.product,
        adjustmentType: formData.adjustmentType,
        quantity: quantity,
        reason: finalReason
      });

      console.log("✅ Stock adjustment submitted:", response.data);

      // ✅ UPDATED SUCCESS MESSAGE
      toast({
        title: "Adjustment Request Submitted",
        description: "Your stock adjustment has been sent for auditor approval",
        duration: 5000,
      });

      // Reset form and close modal
      setFormData({
        product: "",
        adjustmentType: "",
        quantity: "",
        reason: "",
        customReason: ""
      });
      setOpen(false);
      onAdjustmentAdded();

    } catch (error: any) {
      console.error("❌ Failed to submit stock adjustment:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit adjustment request",
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

  const resetForm = () => {
    setFormData({
      product: "",
      adjustmentType: "",
      quantity: "",
      reason: "",
      customReason: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Adjust Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select 
              value={formData.product} 
              onValueChange={(value) => handleChange("product", value)}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="CNG">CNG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type *</Label>
              <Select 
                value={formData.adjustmentType} 
                onValueChange={(value) => handleChange("adjustmentType", value)}
              >
                <SelectTrigger id="adjustmentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addition">Addition</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (L) *</Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="0.00" 
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                required
                min="0.01"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment *</Label>
            <Select 
              value={formData.reason} 
              onValueChange={(value) => handleChange("reason", value)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inventory Correction">Inventory Correction</SelectItem>
                <SelectItem value="Theft/Loss">Theft/Loss</SelectItem>
                <SelectItem value="Evaporation">Evaporation</SelectItem>
                <SelectItem value="Measurement Error">Measurement Error</SelectItem>
                <SelectItem value="Tank Calibration">Tank Calibration</SelectItem>
                <SelectItem value="Quality Adjustment">Quality Adjustment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional notes field for "Other" reason */}
          {formData.reason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Additional Notes *</Label>
              <Textarea
                id="customReason"
                placeholder="Please specify the reason for adjustment..."
                rows={3}
                value={formData.customReason}
                onChange={(e) => handleChange("customReason", e.target.value)}
                required
              />
            </div>
          )}

          {/* Information box showing what will happen */}
          {formData.adjustmentType && formData.quantity && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This adjustment will be submitted for <strong>auditor approval</strong>. {
                  formData.adjustmentType === 'addition' ? 'Addition of' : 
                  formData.adjustmentType === 'deduction' ? 'Deduction of' : 
                  'Calibration to'
                } <strong>{formData.quantity} L</strong> of {formData.product}
                {formData.reason && ` due to: ${formData.reason === "Other" ? formData.customReason : formData.reason}`}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ⏳ The adjustment will be applied only after auditor approval.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};