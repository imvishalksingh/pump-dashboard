import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pump } from "@/data/mockData";

interface PumpFormProps {
  pump?: Pump;
  onSubmit: (data: Partial<Pump>) => void;
  onCancel: () => void;
}

export const PumpForm = ({ pump, onSubmit, onCancel }: PumpFormProps) => {
  const [formData, setFormData] = useState({
    name: pump?.name || "",
    fuelType: pump?.fuelType || "Petrol",
    assignedNozzles: pump?.assignedNozzles || 0,
    status: pump?.status || "Active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Pump Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Pump 1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuelType">Fuel Type</Label>
        <Select value={formData.fuelType} onValueChange={(value: any) => setFormData({ ...formData, fuelType: value })}>
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
        <Label htmlFor="nozzles">Assigned Nozzle Count</Label>
        <Input
          id="nozzles"
          type="number"
          min="0"
          value={formData.assignedNozzles}
          onChange={(e) => setFormData({ ...formData, assignedNozzles: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {pump ? "Update Pump" : "Add Pump"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
