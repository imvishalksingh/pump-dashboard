// components/Modals/AddNozzleModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface Pump {
  _id: string;
  name: string;
  location: string;
  fuelType: string;
}

interface AddNozzleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNozzleAdded: () => void;
}

export const AddNozzleModal = ({ open, onOpenChange, onNozzleAdded }: AddNozzleModalProps) => {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [formData, setFormData] = useState({
    number: "",
    pump: "",
    fuelType: "Petrol",
    status: "Active",
    currentReading: 0,
    rate: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPumps();
      // Reset form when modal opens
      setFormData({
        number: "",
        pump: "",
        fuelType: "Petrol",
        status: "Active",
        currentReading: 0,
        rate: 0
      });
    }
  }, [open]);

  const fetchPumps = async () => {
    try {
      const response = await api.get("/pumps");
      setPumps(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch pumps",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.pump) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/nozzles", formData);
      toast({
        title: "Success",
        description: "Nozzle created successfully",
      });
      onOpenChange(false);
      onNozzleAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create nozzle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Nozzle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Nozzle Number *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="e.g., N-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type *</Label>
              <Select 
                value={formData.fuelType} 
                onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
              >
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="pump">Assign to Pump *</Label>
            <Select 
              value={formData.pump} 
              onValueChange={(value) => setFormData({ ...formData, pump: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a pump" />
              </SelectTrigger>
              <SelectContent>
                {pumps.map((pump) => (
                  <SelectItem key={pump._id} value={pump._id}>
                    {pump.name} - {pump.location} ({pump.fuelType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentReading">Current Reading (L)</Label>
              <Input
                id="currentReading"
                type="number"
                value={formData.currentReading}
                onChange={(e) => setFormData({ ...formData, currentReading: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate (₹/L)</Label>
              <Input
                id="rate"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Nozzle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};