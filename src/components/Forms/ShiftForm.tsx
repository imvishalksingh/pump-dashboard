import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShiftFormProps {
  type: "start" | "end";
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ShiftForm = ({ type, onSubmit, onCancel }: ShiftFormProps) => {
  const [formData, setFormData] = useState({
    nozzleman: "",
    pumpId: "",
    openingReading: "",
    closingReading: "",
    cashCollected: "",
    remarks: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "start" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="nozzleman">Nozzleman Name</Label>
            <Input
              id="nozzleman"
              value={formData.nozzleman}
              onChange={(e) => setFormData({ ...formData, nozzleman: e.target.value })}
              placeholder="Enter nozzleman name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pump">Pump Assigned</Label>
            <Select value={formData.pumpId} onValueChange={(value) => setFormData({ ...formData, pumpId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select pump" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P001">Pump 1 (Petrol)</SelectItem>
                <SelectItem value="P002">Pump 2 (Diesel)</SelectItem>
                <SelectItem value="P003">Pump 3 (CNG)</SelectItem>
                <SelectItem value="P004">Pump 4 (Petrol)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openingReading">Opening Meter Reading</Label>
            <Input
              id="openingReading"
              type="number"
              value={formData.openingReading}
              onChange={(e) => setFormData({ ...formData, openingReading: e.target.value })}
              placeholder="Enter opening reading"
              required
            />
          </div>
        </>
      )}

      {type === "end" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="closingReading">Closing Meter Reading</Label>
            <Input
              id="closingReading"
              type="number"
              value={formData.closingReading}
              onChange={(e) => setFormData({ ...formData, closingReading: e.target.value })}
              placeholder="Enter closing reading"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashCollected">Cash Collected (₹)</Label>
            <Input
              id="cashCollected"
              type="number"
              value={formData.cashCollected}
              onChange={(e) => setFormData({ ...formData, cashCollected: e.target.value })}
              placeholder="Enter total cash"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Any notes or observations"
              rows={3}
            />
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {type === "start" ? "Start Shift" : "End Shift"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
