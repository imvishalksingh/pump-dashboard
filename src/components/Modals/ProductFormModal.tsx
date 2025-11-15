import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductFormData } from "@/types/Product";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: ProductFormData;
}

export const ProductFormModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData 
}: ProductFormModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "Petrol",
    currentPrice: "",
    unit: "Liter",
    status: "Active"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        currentPrice: initialData.currentPrice.toString()
      });
    } else {
      setFormData({
        name: "",
        type: "Petrol",
        currentPrice: "",
        unit: "Liter",
        status: "Active"
      });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.currentPrice) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        type: "Petrol",
        currentPrice: "",
        unit: "Liter",
        status: "Active"
      });
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "Petrol",
      currentPrice: "",
      unit: "Liter",
      status: "Active"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Product Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="CNG">CNG</SelectItem>
                <SelectItem value="Lubricant">Lubricant</SelectItem>
                <SelectItem value="Accessory">Accessory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentPrice">Current Price (₹) *</Label>
            <Input
              id="currentPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
              placeholder="105.50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Liter">Liter</SelectItem>
                <SelectItem value="Kg">Kilogram</SelectItem>
                <SelectItem value="Piece">Piece</SelectItem>
                <SelectItem value="Unit">Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value: "Active" | "Inactive") => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name || !formData.currentPrice || loading}
          >
            {loading ? "Saving..." : (initialData ? "Update Product" : "Create Product")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};