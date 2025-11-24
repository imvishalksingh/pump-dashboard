// components/Modals/AddPumpModal.tsx
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

interface AddPumpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPumpAdded: () => void;
}

export const AddPumpModal = ({ open, onOpenChange, onPumpAdded }: AddPumpModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    fuelType: "Petrol",
    status: "Active",
    currentReading: "0"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/pumps", {
        name: formData.name,
        location: formData.location,
        fuelType: formData.fuelType,
        status: formData.status,
        currentReading: parseFloat(formData.currentReading) || 0
      });

      toast({
        title: "Success",
        description: "Pump created successfully",
      });

      // Reset form and close modal
      setFormData({
        name: "",
        location: "",
        fuelType: "Petrol",
        status: "Active",
        currentReading: "0"
      });
      onOpenChange(false);
      onPumpAdded(); // Refresh the pump list

    } catch (error: any) {
      console.error("Failed to create pump:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create pump",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Pump</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Pump Name *</Label>
            <Input 
              id="name" 
              placeholder="Enter pump name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input 
              id="location" 
              placeholder="Enter pump location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type *</Label>
              <Select value={formData.fuelType} onValueChange={(value) => handleChange("fuelType", value)}>
                <SelectTrigger id="fuelType">
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
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentReading">Current Reading (Liters)</Label>
            <Input 
              id="currentReading" 
              type="number"
              placeholder="0"
              value={formData.currentReading}
              onChange={(e) => handleChange("currentReading", e.target.value)}
              min="0"
              step="0.01"
            />
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
              {loading ? "Creating..." : "Create Pump"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};