// components/Modals/NozzleAssignModal.tsx - UPDATED
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
  status: string;
}

interface Nozzle {
  _id: string;
  number: string;
  pump: {
    _id: string;
    name: string;
  };
  status: string;
  fuelType: string;
}

interface Pump {
  _id: string;
  name: string;
  status: string;
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
  nozzlemen = []
}: NozzleAssignModalProps) => {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [alreadyAssignedNozzles, setAlreadyAssignedNozzles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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
      fetchAllData();
      // Reset form when opening modal
      setFormData({
        nozzleman: "",
        nozzle: "",
        pump: "",
        shift: "Morning",
        assignedDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [open]);

  // Fetch already assigned nozzles when date or shift changes
  useEffect(() => {
    if (formData.assignedDate && formData.shift) {
      fetchAlreadyAssignedNozzles();
    }
  }, [formData.assignedDate, formData.shift]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchNozzles(), fetchPumps()]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch required data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNozzles = async () => {
    try {
      const response = await api.get("/api/nozzles");
      console.log("Nozzles data:", response.data);
      setNozzles(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch nozzles:", error);
      setNozzles([]);
    }
  };

  const fetchPumps = async () => {
    try {
      const response = await api.get("/api/pumps");
      console.log("Pumps data:", response.data);
      setPumps(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch pumps:", error);
      setPumps([]);
    }
  };

  const fetchAlreadyAssignedNozzles = async () => {
    try {
      console.log("🔍 Fetching already assigned nozzles for:", {
        date: formData.assignedDate,
        shift: formData.shift
      });
      
      const response = await api.get("/api/assignments", {
        params: {
          date: formData.assignedDate,
          shift: formData.shift,
          status: "Active"
        }
      });
      
      // Extract nozzle IDs that are already assigned
      const assignedNozzleIds = response.data
        .filter((assignment: any) => assignment.nozzle?._id)
        .map((assignment: any) => assignment.nozzle._id);
      
      console.log("📋 Already assigned nozzle IDs:", assignedNozzleIds);
      setAlreadyAssignedNozzles(assignedNozzleIds);
      
    } catch (error) {
      console.error("Failed to fetch assigned nozzles:", error);
      setAlreadyAssignedNozzles([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if nozzle is already assigned
    if (alreadyAssignedNozzles.includes(formData.nozzle)) {
      toast({
        title: "Error",
        description: "This nozzle is already assigned for the selected date and shift",
        variant: "destructive",
      });
      return;
    }
    
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
  const activeNozzlemen = Array.isArray(nozzlemen) 
    ? nozzlemen.filter(nozzleman => 
        nozzleman && 
        nozzleman.status && 
        nozzleman.status.toString().toLowerCase() === "active"
      )
    : [];

  // Filter only active nozzles
  const activeNozzles = Array.isArray(nozzles) 
    ? nozzles.filter(nozzle => 
        nozzle && 
        nozzle.status && 
        nozzle.status.toString().toLowerCase() === "active"
      )
    : [];

  // Filter out already assigned nozzles
  const availableNozzles = activeNozzles.filter(
    nozzle => !alreadyAssignedNozzles.includes(nozzle._id)
  );

  // Filter only active pumps
  const activePumps = Array.isArray(pumps) 
    ? pumps.filter(pump => 
        pump && 
        pump.status && 
        pump.status.toString().toLowerCase() === "active"
      )
    : [];

  console.log("🔍 Modal Data:", {
    totalNozzles: nozzles.length,
    activeNozzles: activeNozzles.length,
    alreadyAssigned: alreadyAssignedNozzles.length,
    availableNozzles: availableNozzles.length,
    formData,
    selectedNozzle: nozzles.find(n => n._id === formData.nozzle)?.number
  });

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
              disabled={loading}
            >
              <SelectTrigger>
                {loading ? (
                  <SelectValue placeholder="Loading..." />
                ) : (
                  <SelectValue placeholder="Select nozzleman" />
                )}
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading nozzlemen...
                  </SelectItem>
                ) : activeNozzlemen.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    No active nozzlemen available
                  </SelectItem>
                ) : (
                  activeNozzlemen.map((nozzleman) => (
                    <SelectItem key={nozzleman._id} value={nozzleman._id}>
                      {nozzleman.name} ({nozzleman.employeeId || nozzleman._id.slice(-6)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nozzle">Nozzle *</Label>
            <Select 
              value={formData.nozzle} 
              onValueChange={handleNozzleChange}
              disabled={loading}
            >
              <SelectTrigger>
                {loading ? (
                  <SelectValue placeholder="Loading..." />
                ) : (
                  <SelectValue placeholder="Select nozzle" />
                )}
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading nozzles...
                  </SelectItem>
                ) : availableNozzles.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    No available nozzles for {formData.shift} shift on {formData.assignedDate}
                  </SelectItem>
                ) : (
                  availableNozzles.map((nozzle) => (
                    <SelectItem key={nozzle._id} value={nozzle._id}>
                      {nozzle.number || `Nozzle-${nozzle._id.slice(-6)}`} - 
                      {nozzle.pump?.name || "Unknown Pump"} 
                      ({nozzle.fuelType || "Unknown"})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!loading && alreadyAssignedNozzles.length > 0 && (
              <p className="text-sm text-amber-600">
                {alreadyAssignedNozzles.length} nozzle(s) already assigned for {formData.shift} shift on {formData.assignedDate}
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
                {activePumps.map((pump) => (
                  <SelectItem key={pump._id} value={pump._id}>
                    {pump.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Assignment Status:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Nozzlemen Available: {activeNozzlemen.length}</li>
              <li>• Nozzles Available: {availableNozzles.length} of {activeNozzles.length}</li>
              <li>• Already Assigned: {alreadyAssignedNozzles.length} nozzle(s)</li>
              <li>• Date: {formData.assignedDate}</li>
              <li>• Shift: {formData.shift}</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                loading ||
                !formData.nozzleman || 
                !formData.nozzle || 
                !formData.pump ||
                activeNozzlemen.length === 0 ||
                availableNozzles.length === 0
              }
            >
              {loading ? "Loading..." : "Assign Nozzle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};