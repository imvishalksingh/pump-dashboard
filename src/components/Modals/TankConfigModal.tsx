// components/Modals/TankConfigModal.tsx - UPDATED
import { useState, useEffect } from "react";
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

interface TankConfig {
  _id?: string;
  tankName: string;
  product: "MS" | "HSD";
  capacity: number;
  isActive?: boolean;
  lastCalibrationBy?: string;
}

interface TankConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tank?: TankConfig | null;
  onSuccess: () => void;
}

export const TankConfigModal = ({ 
  open, 
  onOpenChange, 
  tank, 
  onSuccess 
}: TankConfigModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<TankConfig>({
    tankName: "",
    product: "MS",
    capacity: 0,
    isActive: true
  });

  useEffect(() => {
    if (tank) {
      setFormData(tank);
    } else {
      setFormData({
        tankName: "",
        product: "MS",
        capacity: 0,
        isActive: true
      });
    }
  }, [tank, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.tankName || !formData.capacity) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.capacity <= 0) {
      toast({
        title: "Invalid capacity",
        description: "Capacity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (tank?._id) {
        // Update existing tank
        await api.put(`/api/tanks/config/${tank._id}`, formData);
        toast({
          title: "Success",
          description: "Tank configuration updated successfully",
        });
      } else {
        // Create new tank
        await api.post("/api/tanks/config", formData);
        toast({
          title: "Success",
          description: "Tank configuration created successfully",
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to save tank configuration:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save tank configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getProductDescription = (product: "MS" | "HSD") => {
    const descriptions = {
      "MS": "Motor Spirit (Petrol) - Uses mathematical formula for volume calculation",
      "HSD": "High Speed Diesel - Uses mathematical formula for volume calculation"
    };
    return descriptions[product];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tank ? "Edit Tank Configuration" : "Add New Tank"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="tankName">Tank Name *</Label>
            <Input 
              id="tankName" 
              placeholder="e.g., Main MS Tank, HSD Storage Tank"
              value={formData.tankName}
              onChange={(e) => handleChange("tankName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product Type *</Label>
            <Select 
              value={formData.product} 
              onValueChange={(value: "MS" | "HSD") => handleChange("product", value)}
            >
              <SelectTrigger id="product">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MS">Motor Spirit (Petrol)</SelectItem>
                <SelectItem value="HSD">High Speed Diesel</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getProductDescription(formData.product)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Tank Capacity (Liters) *</Label>
            <Input 
              id="capacity" 
              type="number"
              placeholder="10000"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", parseFloat(e.target.value) || 0)}
              required
              min="0"
              step="1"
            />
            <p className="text-xs text-muted-foreground">
              Total storage capacity in liters
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Volume Calculation</h4>
            <p className="text-xs text-blue-700">
              This tank will use mathematical formulas for volume calculation:
              <br />
              <strong>MS (Petrol):</strong> 496.8 * 10000.0 * (acos(x) - (x * sqrt(1 - x * x))) / 1000.0
              <br />
              <strong>HSD (Diesel):</strong> 671.8 * 10000.0 * (acos(x) - (x * sqrt(1 - x * x))) / 1000.0
              <br />
              where x = 1 - (dipReading / 100.0)
            </p>
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
              {loading ? "Saving..." : (tank ? "Update Tank" : "Create Tank")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};