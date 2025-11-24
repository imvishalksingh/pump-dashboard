// components/Tank/CalibrationModal.tsx
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface CalibrationPoint {
  dipMM: number;
  volumeLiters: number;
}

interface TankConfig {
  _id: string;
  tankName: string;
  calibrationTable: CalibrationPoint[];
}

interface CalibrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tank: TankConfig | null;
  onSuccess: () => void;
}

export const CalibrationModal = ({ 
  open, 
  onOpenChange, 
  tank, 
  onSuccess 
}: CalibrationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPoint, setNewPoint] = useState({ dipMM: "", volumeLiters: "" });
  const [calibrationTable, setCalibrationTable] = useState<CalibrationPoint[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (tank) {
      setCalibrationTable(tank.calibrationTable || []);
    } else {
      setCalibrationTable([]);
    }
    setNewPoint({ dipMM: "", volumeLiters: "" });
  }, [tank, open]);

  const handleAddPoint = () => {
    const dipMM = parseFloat(newPoint.dipMM);
    const volumeLiters = parseFloat(newPoint.volumeLiters);

    if (isNaN(dipMM) || isNaN(volumeLiters) || dipMM < 0 || volumeLiters < 0) {
      toast({
        title: "Invalid values",
        description: "Please enter valid positive numbers",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate dip reading
    if (calibrationTable.find(point => point.dipMM === dipMM)) {
      toast({
        title: "Duplicate reading",
        description: "A calibration point with this dip reading already exists",
        variant: "destructive",
      });
      return;
    }

    const updatedTable = [...calibrationTable, { dipMM, volumeLiters }]
      .sort((a, b) => a.dipMM - b.dipMM);
    
    setCalibrationTable(updatedTable);
    setNewPoint({ dipMM: "", volumeLiters: "" });
  };

  const handleRemovePoint = (index: number) => {
    const updatedTable = calibrationTable.filter((_, i) => i !== index);
    setCalibrationTable(updatedTable);
  };

  const handleSaveCalibration = async () => {
    if (!tank) return;

    if (calibrationTable.length === 0) {
      toast({
        title: "No data",
        description: "Please add at least one calibration point",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Replace entire calibration table
      await api.put(`/api/tanks/config/${tank._id}`, {
        calibrationTable
      });

      toast({
        title: "Success",
        description: "Calibration table updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save calibration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tank) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await api.post(
        `/api/tanks/config/${tank._id}/upload-calibration`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setCalibrationTable(response.data.calibrationTable);
      
      toast({
        title: "Success",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload CSV",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = "dip,liters\n0,0\n100,500\n200,1500\n300,3200";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calibration-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!tank) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Calibrate Tank: {tank.tankName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* CSV Upload Section */}
          <div className="space-y-4">
            <Label>Upload Calibration CSV</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                disabled={uploading}
              >
                Template
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              CSV format: dip (mm), liters (volume). Columns: dip, liters
            </p>
          </div>

          {/* Manual Entry Section */}
          <div className="space-y-4">
            <Label>Add Calibration Point Manually</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="dipMM">Dip Reading (mm)</Label>
                <Input
                  id="dipMM"
                  type="number"
                  placeholder="100"
                  value={newPoint.dipMM}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, dipMM: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="volumeLiters">Volume (Liters)</Label>
                <Input
                  id="volumeLiters"
                  type="number"
                  placeholder="500"
                  value={newPoint.volumeLiters}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, volumeLiters: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddPoint} className="w-full">
                  Add Point
                </Button>
              </div>
            </div>
          </div>

          {/* Calibration Table */}
          <div className="space-y-2">
            <Label>Calibration Table ({calibrationTable.length} points)</Label>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dip (mm)</TableHead>
                    <TableHead>Volume (Liters)</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calibrationTable.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>{point.dipMM}</TableCell>
                      <TableCell>{point.volumeLiters.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePoint(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {calibrationTable.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No calibration points added
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCalibration} 
              disabled={loading || calibrationTable.length === 0}
            >
              {loading ? "Saving..." : "Save Calibration"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};