// components/Modals/ShiftEndModal.tsx - FIXED VERSION
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface Shift {
  _id: string;
  shiftId: string;
  nozzleman: {
    _id: string;
    name: string;
    employeeId: string;
  } | null;
  pump: {
    _id: string;
    name: string;
  } | null;
  nozzle: {
    _id: string;
    number: string;
    fuelType: string;
  } | null;
  startTime: string;
  startReading: number;
  status: string;
}

interface ShiftEndModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShiftEnded: () => void;
}

export const ShiftEndModal = ({ open, onOpenChange, onShiftEnded }: ShiftEndModalProps) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [formData, setFormData] = useState({
    endReading: "",
    cashCollected: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchActiveShifts();
      // Reset form when modal opens
      setFormData({
        endReading: "",
        cashCollected: "",
        notes: ""
      });
      setSelectedShiftId("");
    }
  }, [open]);

  const fetchActiveShifts = async () => {
    try {
      const response = await api.get("/shifts");
      // Filter only active shifts
      const activeShifts = response.data.filter((shift: Shift) => shift.status === "Active");
      setShifts(activeShifts);
    } catch (error: any) {
      console.error("Failed to fetch active shifts:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch active shifts",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShiftId) {
      toast({
        title: "Error",
        description: "Please select a shift to end",
        variant: "destructive",
      });
      return;
    }

    if (!formData.endReading) {
      toast({
        title: "Error",
        description: "Please provide end reading",
        variant: "destructive",
      });
      return;
    }

    const selectedShift = shifts.find(shift => shift._id === selectedShiftId);
    if (!selectedShift) {
      toast({
        title: "Error",
        description: "Selected shift not found",
        variant: "destructive",
      });
      return;
    }

    const endReading = parseFloat(formData.endReading);
    if (endReading < selectedShift.startReading) {
      toast({
        title: "Error",
        description: "End reading cannot be less than start reading",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.put(`/shifts/end/${selectedShiftId}`, {
        endReading: endReading,
        cashCollected: formData.cashCollected ? parseFloat(formData.cashCollected) : 0,
        notes: formData.notes
      });

      toast({
        title: "Success",
        description: "Shift ended successfully",
      });
      
      onOpenChange(false);
      onShiftEnded();
    } catch (error: any) {
      console.error("Failed to end shift:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to end shift",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedShift = shifts.find(shift => shift._id === selectedShiftId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>End Shift</DialogTitle>
          <DialogDescription>
            Complete an active shift by providing the final readings and cash collected.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shift Selection */}
          <div className="space-y-2">
            <Label htmlFor="shift">Select Shift to End *</Label>
            <select
              id="shift"
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Select a shift</option>
              {shifts.map((shift) => (
                <option key={shift._id} value={shift._id}>
                  {shift.shiftId} - {shift.nozzleman?.name || "Unknown Nozzleman"} - {shift.pump?.name || "Unknown Pump"}
                </option>
              ))}
            </select>
            {shifts.length === 0 && (
              <p className="text-sm text-amber-600">
                No active shifts found. Start a shift first.
              </p>
            )}
          </div>

          {/* Shift Details */}
          {selectedShift && (
            <div className="bg-muted p-3 rounded-md space-y-2">
              <h4 className="font-medium text-sm">Shift Details:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nozzleman:</span>
                  <div className="font-medium">{selectedShift.nozzleman?.name || "Unknown"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pump:</span>
                  <div className="font-medium">{selectedShift.pump?.name || "Unknown"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Nozzle:</span>
                  <div className="font-medium">
                    {selectedShift.nozzle ? 
                      `${selectedShift.nozzle.number} (${selectedShift.nozzle.fuelType})` : 
                      "Unknown"
                    }
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Start Reading:</span>
                  <div className="font-medium">{selectedShift.startReading.toLocaleString()} L</div>
                </div>
              </div>
            </div>
          )}

          {/* End Reading */}
          <div className="space-y-2">
            <Label htmlFor="endReading">End Reading (Liters) *</Label>
            <Input
              id="endReading"
              type="number"
              value={formData.endReading}
              onChange={(e) => setFormData({ ...formData, endReading: e.target.value })}
              placeholder="Enter final meter reading"
              min={selectedShift ? selectedShift.startReading : 0}
              step="0.01"
              required
            />
            {selectedShift && formData.endReading && (
              <p className="text-sm text-muted-foreground">
                Fuel dispensed: {(
                  parseFloat(formData.endReading) - selectedShift.startReading
                ).toLocaleString()} L
              </p>
            )}
          </div>

          {/* Cash Collected */}
          <div className="space-y-2">
            <Label htmlFor="cashCollected">Cash Collected (₹)</Label>
            <Input
              id="cashCollected"
              type="number"
              value={formData.cashCollected}
              onChange={(e) => setFormData({ ...formData, cashCollected: e.target.value })}
              placeholder="Enter total cash collected"
              min="0"
              step="0.01"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes or observations..."
              rows={3}
            />
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
            <Button 
              type="submit" 
              disabled={loading || !selectedShiftId || !formData.endReading}
            >
              {loading ? "Ending Shift..." : "End Shift"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};