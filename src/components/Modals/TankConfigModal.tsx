// components/Tank/TankConfigModal.tsx - UPDATED
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
  product: string;
  capacity: number;
  tankShape: string;
  dimensions: {
    length?: number;
    diameter?: number;
    width?: number;
    height?: number;
  };
  calibrationTable?: Array<{
    dipMM: number;
    volumeLiters: number;
  }>;
  isActive?: boolean;
  calibrationDate?: string;
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
    product: "Petrol",
    capacity: 0,
    tankShape: "horizontal_cylinder",
    dimensions: {
      length: 0,
      diameter: 0,
      width: 0,
      height: 0
    },
    isActive: true
  });

  useEffect(() => {
    if (tank) {
      setFormData(tank);
    } else {
      setFormData({
        tankName: "",
        product: "Petrol",
        capacity: 0,
        tankShape: "horizontal_cylinder",
        dimensions: {
          length: 0,
          diameter: 0,
          width: 0,
          height: 0
        },
        isActive: true
      });
    }
  }, [tank, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on tank shape
    let isValid = true;
    let errorMessage = "";

    if (!formData.tankName || !formData.capacity) {
      isValid = false;
      errorMessage = "Please fill in all required fields";
    }

    if (formData.capacity <= 0) {
      isValid = false;
      errorMessage = "Capacity must be greater than 0";
    }

    // Shape-specific validation
    switch (formData.tankShape) {
      case "horizontal_cylinder":
        if (!formData.dimensions.diameter || !formData.dimensions.length) {
          isValid = false;
          errorMessage = "Diameter and length are required for cylindrical tanks";
        }
        if (formData.dimensions.diameter <= 0 || formData.dimensions.length <= 0) {
          isValid = false;
          errorMessage = "Diameter and length must be greater than 0";
        }
        break;
      
      case "rectangular":
        if (!formData.dimensions.length || !formData.dimensions.width || !formData.dimensions.height) {
          isValid = false;
          errorMessage = "Length, width, and height are required for rectangular tanks";
        }
        if (formData.dimensions.length <= 0 || formData.dimensions.width <= 0 || formData.dimensions.height <= 0) {
          isValid = false;
          errorMessage = "All dimensions must be greater than 0";
        }
        break;
      
      case "capsule":
        if (!formData.dimensions.diameter || !formData.dimensions.length) {
          isValid = false;
          errorMessage = "Diameter and length are required for capsule tanks";
        }
        if (formData.dimensions.diameter <= 0 || formData.dimensions.length <= 0) {
          isValid = false;
          errorMessage = "Diameter and length must be greater than 0";
        }
        break;
    }

    if (!isValid) {
      toast({
        title: "Missing fields",
        description: errorMessage,
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

  const handleDimensionChange = (dimension: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: parseFloat(value) || 0
      }
    }));
  };

  const renderDimensionFields = () => {
    switch (formData.tankShape) {
      case "horizontal_cylinder":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diameter">Diameter (meters) *</Label>
              <Input 
                id="diameter" 
                type="number"
                placeholder="2.0"
                value={formData.dimensions.diameter || 0}
                onChange={(e) => handleDimensionChange("diameter", e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (meters) *</Label>
              <Input 
                id="length" 
                type="number"
                placeholder="4.0"
                value={formData.dimensions.length || 0}
                onChange={(e) => handleDimensionChange("length", e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>
        );

      case "rectangular":
        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (meters) *</Label>
              <Input 
                id="length" 
                type="number"
                placeholder="4.0"
                value={formData.dimensions.length || 0}
                onChange={(e) => handleDimensionChange("length", e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width (meters) *</Label>
              <Input 
                id="width" 
                type="number"
                placeholder="2.5"
                value={formData.dimensions.width || 0}
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (meters) *</Label>
              <Input 
                id="height" 
                type="number"
                placeholder="2.0"
                value={formData.dimensions.height || 0}
                onChange={(e) => handleDimensionChange("height", e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>
        );

      case "capsule":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diameter">Diameter (meters) *</Label>
              <Input 
                id="diameter" 
                type="number"
                placeholder="2.0"
                value={formData.dimensions.diameter || 0}
                onChange={(e) => handleDimensionChange("diameter", e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (meters) *</Label>
              <Input 
                id="length" 
                type="number"
                placeholder="4.0"
                value={formData.dimensions.length || 0}
                onChange={(e) => handleDimensionChange("length", e.target.value)}
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label>Custom Tank Configuration</Label>
            <p className="text-sm text-muted-foreground">
              Use the calibration table to define the exact dip-to-volume mapping for custom tanks.
            </p>
          </div>
        );
    }
  };

  const getTankShapeDescription = (shape: string) => {
    const descriptions: { [key: string]: string } = {
      horizontal_cylinder: "Horizontal cylindrical tank (most common for fuel storage)",
      rectangular: "Rectangular tank (rare for fuel, more common for water)",
      capsule: "Capsule tank (cylinder with spherical ends)",
      custom: "Custom tank shape (requires full calibration table)"
    };
    return descriptions[shape] || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {tank ? "Edit Tank Configuration" : "Add New Tank"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tankName">Tank Name *</Label>
              <Input 
                id="tankName" 
                placeholder="e.g., Main Petrol Tank"
                value={formData.tankName}
                onChange={(e) => handleChange("tankName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select 
                value={formData.product} 
                onValueChange={(value) => handleChange("product", value)}
              >
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="tankShape">Tank Shape *</Label>
            <Select 
              value={formData.tankShape} 
              onValueChange={(value) => handleChange("tankShape", value)}
            >
              <SelectTrigger id="tankShape">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal_cylinder">Horizontal Cylinder</SelectItem>
                <SelectItem value="capsule">Capsule</SelectItem>
                <SelectItem value="rectangular">Rectangular</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getTankShapeDescription(formData.tankShape)}
            </p>
          </div>

          {renderDimensionFields()}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Calibration Required</h4>
            <p className="text-xs text-blue-700">
              After creating this tank, you'll need to add a calibration table with dip-to-volume mappings. 
              This ensures accurate fuel measurement as required by weights and measures standards.
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