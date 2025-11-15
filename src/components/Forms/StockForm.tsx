import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StockFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const StockForm = ({ onSubmit, onCancel }: StockFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    product: "Petrol",
    quantity: "",
    invoiceNo: "",
    pricePerLiter: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Purchase Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier Name</Label>
        <Input
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder="Enter supplier name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Fuel Type</Label>
        <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value })}>
          <SelectTrigger>
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
        <Label htmlFor="quantity">Quantity Received (Liters)</Label>
        <Input
          id="quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          placeholder="Enter quantity"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price Per Liter (₹)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.pricePerLiter}
          onChange={(e) => setFormData({ ...formData, pricePerLiter: e.target.value })}
          placeholder="Enter price"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice">Invoice Number</Label>
        <Input
          id="invoice"
          value={formData.invoiceNo}
          onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
          placeholder="Enter invoice number"
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Record Purchase
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
