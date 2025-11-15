// components/Modals/ShiftStartModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface SimplifiedNozzleman {
  _id: string;
  name: string;
  employeeId: string;
}

interface Nozzle {
  _id: string;
  number: string;
  pump: {
    _id: string;
    name: string;
  };
  currentReading: number;
}

export interface ShiftStartData {
  nozzleman: string;
  pump: string;
  nozzle: string;
  startReading: number;
}

interface ShiftStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShiftStarted?: () => void;
}

export const ShiftStartModal = ({ 
  open, 
  onOpenChange, 
  onShiftStarted 
}: ShiftStartModalProps) => {
  const [nozzlemen, setNozzlemen] = useState<SimplifiedNozzleman[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [formData, setFormData] = useState<ShiftStartData>({
    nozzleman: "",
    pump: "",
    nozzle: "",
    startReading: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchNozzlemen();
      fetchNozzles();
    }
  }, [open]);

  const fetchNozzlemen = async () => {
    try {
      const response = await api.get("/nozzlemen");
      setNozzlemen(response.data.filter((n: any) => n.status === "Active"));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch nozzlemen",
        variant: "destructive",
      });
    }
  };

  const fetchNozzles = async () => {
    try {
      const response = await api.get("/nozzles");
      setNozzles(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch nozzles",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nozzleman || !formData.nozzle || !formData.startReading) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/shifts/start", formData);
      toast({
        title: "Success",
        description: "Shift started successfully",
      });
      onOpenChange(false);
      onShiftStarted?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start shift",
        variant: "destructive",
      });
    }
  };

  const handleNozzleChange = (nozzleId: string) => {
    const selectedNozzle = nozzles.find(n => n._id === nozzleId);
    if (selectedNozzle) {
      setFormData({
        ...formData,
        nozzle: nozzleId,
        pump: selectedNozzle.pump._id,
        startReading: selectedNozzle.currentReading
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Shift</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nozzleman">Nozzleman</Label>
            <Select value={formData.nozzleman} onValueChange={(value) => setFormData({ ...formData, nozzleman: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select nozzleman" />
              </SelectTrigger>
              <SelectContent>
                {nozzlemen.map((nozzleman) => (
                  <SelectItem key={nozzleman._id} value={nozzleman._id}>
                    {nozzleman.name} ({nozzleman.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nozzle">Nozzle</Label>
            <Select value={formData.nozzle} onValueChange={handleNozzleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select nozzle" />
              </SelectTrigger>
              <SelectContent>
                {nozzles.map((nozzle) => (
                  <SelectItem key={nozzle._id} value={nozzle._id}>
                    {nozzle.number} - {nozzle.pump.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startReading">Start Reading</Label>
            <Input
              id="startReading"
              type="number"
              value={formData.startReading}
              onChange={(e) => setFormData({ ...formData, startReading: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Start Shift
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};