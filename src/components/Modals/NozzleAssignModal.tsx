// components/Modals/NozzleAssignModal.tsx - UPDATED VERSION
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  status: string; // Add status field
  fuelType: string;
}

interface Pump {
  _id: string;
  name: string;
  status: string; // Add status field
}

export interface AssignmentFormData {
  nozzleman: string;
  nozzle: string;
  pump: string;
  shift: string;
  assignedDate: string;
  startTime?: string;
  endTime?: string;
}

interface NozzleAssignModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentFormData) => void;
  nozzlemen: SimplifiedNozzleman[];
}

export const NozzleAssignModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  nozzlemen 
}: NozzleAssignModalProps) => {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [formData, setFormData] = useState<AssignmentFormData>({
    nozzleman: "",
    nozzle: "",
    pump: "",
    shift: "Morning",
    assignedDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchNozzles();
      fetchPumps();
    }
  }, [open]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nozzleman || !formData.nozzle || !formData.pump) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
  };

  const handleNozzleChange = (nozzleId: string) => {
    const selectedNozzle = nozzles.find(n => n._id === nozzleId);
    if (selectedNozzle) {
      setFormData({
        ...formData,
        nozzle: nozzleId,
        pump: selectedNozzle.pump._id
      });
    }
  };

  // Filter only active nozzlemen
  const activeNozzlemen = nozzlemen;

  // Filter only active nozzles
  const activeNozzles = nozzles.filter(nozzle => nozzle.status === "Active");

  // Filter only active pumps
  const activePumps = pumps.filter(pump => pump.status === "Active");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Nozzle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nozzleman">Nozzleman *</Label>
            <Select 
              value={formData.nozzleman} 
              onValueChange={(value) => setFormData({ ...formData, nozzleman: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select nozzleman" />
              </SelectTrigger>
              <SelectContent>
                {activeNozzlemen.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    No active nozzlemen available
                  </SelectItem>
                ) : (
                  activeNozzlemen.map((nozzleman) => (
                    <SelectItem key={nozzleman._id} value={nozzleman._id}>
                      {nozzleman.name} ({nozzleman.employeeId})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {activeNozzlemen.length === 0 && (
              <p className="text-sm text-amber-600">
                No active nozzlemen available. Please activate a nozzleman first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nozzle">Nozzle *</Label>
            <Select 
              value={formData.nozzle} 
              onValueChange={handleNozzleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select nozzle" />
              </SelectTrigger>
              <SelectContent>
                {activeNozzles.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    No active nozzles available
                  </SelectItem>
                ) : (
                  activeNozzles.map((nozzle) => (
                    <SelectItem key={nozzle._id} value={nozzle._id}>
                      {nozzle.number} - {nozzle.pump.name} ({nozzle.fuelType})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {activeNozzles.length === 0 && (
              <p className="text-sm text-amber-600">
                No active nozzles available. Please activate a nozzle first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pump">Pump *</Label>
            <Select 
              value={formData.pump} 
              onValueChange={(value) => setFormData({ ...formData, pump: value })} 
              disabled
            >
              <SelectTrigger>
                <SelectValue placeholder="Auto-selected from nozzle" />
              </SelectTrigger>
              <SelectContent>
                {activePumps.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    No active pumps available
                  </SelectItem>
                ) : (
                  activePumps.map((pump) => (
                    <SelectItem key={pump._id} value={pump._id}>
                      {pump.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {activePumps.length === 0 && (
              <p className="text-sm text-amber-600">
                No active pumps available. Please activate a pump first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Shift *</Label>
            <Select 
              value={formData.shift} 
              onValueChange={(value) => setFormData({ ...formData, shift: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedDate">Assignment Date *</Label>
            <input
              type="date"
              value={formData.assignedDate}
              onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Assignment Rules:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Only Active nozzlemen can be assigned</li>
              <li>• Only Active nozzles can be assigned</li>
              <li>• Only Active pumps can be used</li>
              <li>• Pump is auto-selected based on nozzle</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                !formData.nozzleman || 
                !formData.nozzle || 
                !formData.pump ||
                activeNozzlemen.length === 0 ||
                activeNozzles.length === 0 ||
                activePumps.length === 0
              }
            >
              Assign Nozzle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};