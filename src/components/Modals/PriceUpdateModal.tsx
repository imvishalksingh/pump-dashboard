import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product, PriceUpdateData } from "@/types/Product";

interface PriceUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PriceUpdateData) => Promise<void>;
  products: Product[];
}

export const PriceUpdateModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  products = [] 
}: PriceUpdateModalProps) => {
  const [formData, setFormData] = useState<PriceUpdateData>({
    productId: "",
    newPrice: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!open) {
      setFormData({ productId: "", newPrice: "", reason: "" });
      setSelectedProduct(null);
    }
  }, [open]);

  useEffect(() => {
    if (formData.productId && products.length > 0) {
      const product = products.find(p => p._id === formData.productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  const handleSubmit = async () => {
    if (!formData.productId || !formData.newPrice) {
      alert("Please select a product and enter a valid price");
      return;
    }

    const priceValue = parseFloat(formData.newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ productId: "", newPrice: "", reason: "" });
      setSelectedProduct(null);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ productId: "", newPrice: "", reason: "" });
    setSelectedProduct(null);
    onOpenChange(false);
  };

  const activeProducts = products.filter(product => product.status === "Active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Product Price</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product">Select Product *</Label>
            <Select 
              value={formData.productId} 
              onValueChange={(value) => setFormData({ ...formData, productId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {activeProducts.length === 0 ? (
                  <SelectItem value="" disabled>No active products available</SelectItem>
                ) : (
                  activeProducts.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} ({product.type}) - ₹{(product.currentPrice || 0).toFixed(2)}/{product.unit}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="bg-muted p-3 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-semibold">₹{(selectedProduct.currentPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product Type:</span>
                <span>{selectedProduct.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit:</span>
                <span>{selectedProduct.unit}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPrice">New Price (₹) *</Label>
            <Input
              id="newPrice"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.newPrice}
              onChange={(e) => setFormData({ ...formData, newPrice: e.target.value })}
              placeholder="105.50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Price Change</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Enter reason for price change (e.g., market adjustment, cost increase)"
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
            <p className="text-amber-800 text-sm">
              ⚠️ Price change will require approval from manager before taking effect.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.productId || !formData.newPrice || loading || activeProducts.length === 0}
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};