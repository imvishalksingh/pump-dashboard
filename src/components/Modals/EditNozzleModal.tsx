// components/Modals/EditNozzleModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface Nozzle {
  _id: string;
  number: string;
  pump: {
    _id: string;
    name: string;
  };
  fuelType: string;
  status: string;
  currentReading: number;
  rate: number;
}

interface EditNozzleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nozzle: Nozzle | null;
  onNozzleUpdated: () => void;
}

export const EditNozzleModal = ({ open, onOpenChange, nozzle, onNozzleUpdated }: EditNozzleModalProps) => {
  const [formData, setFormData] = useState({
    number: "",
    fuelType: "Petrol",
    status: "Active",
    currentReading: 0,
    rate: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (nozzle && open) {
      setFormData({
        number: nozzle.number,
        fuelType: nozzle.fuelType,
        status: nozzle.status,
        currentReading: nozzle.currentReading,
        rate: nozzle.rate
      });
    }
  }, [nozzle, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nozzle) return;

    setLoading(true);
    try {
      await api.put(`/nozzles/${nozzle._id}`, formData);
      toast({
        title: "Success",
        description: "Nozzle updated successfully",
      });
      onOpenChange(false);
      onNozzleUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update nozzle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!nozzle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Nozzle - {nozzle.number}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Nozzle Number</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel Type</Label>
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
              {loading ? "Updating..." : "Update Nozzle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};