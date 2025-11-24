// pages/TankManagement.tsx - UPDATED
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Droplet, Upload, Table, AlertTriangle, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { TankConfigModal } from "@/components/Modals/TankConfigModal";
import { CalibrationModal } from "@/components/Modals/CalibrationModal";

// pages/TankManagement.tsx - Update the interface at the top
interface TankConfig {
  _id: string;
  tankName: string;
  product: string;
  capacity: number;
  tankShape: string;
  dimensions: {
    length?: number;
    diameter?: number;
    width?: number;
    height?: number;
  };
  calibrationTable: Array<{
    dipMM: number;
    volumeLiters: number;
  }>;
  isActive: boolean;
  calibrationDate: string;
  lastCalibrationBy?: string;
  createdAt: string;
}

// Remove the old calculateVolume function and replace with:
const getTankVolumeInfo = (tank: TankConfig) => {
  const { dimensions, tankShape } = tank;
  
  switch (tankShape) {
    case "horizontal_cylinder":
      if (dimensions.diameter && dimensions.length) {
        const radius = dimensions.diameter / 2;
        const volume = Math.PI * Math.pow(radius, 2) * dimensions.length;
        return volume.toFixed(2) + ' m³';
      }
      break;
      
    case "rectangular":
      if (dimensions.length && dimensions.width && dimensions.height) {
        const volume = dimensions.length * dimensions.width * dimensions.height;
        return volume.toFixed(2) + ' m³';
      }
      break;
      
    case "capsule":
      if (dimensions.diameter && dimensions.length) {
        const radius = dimensions.diameter / 2;
        const cylinderLength = dimensions.length - dimensions.diameter;
        const cylinderVolume = Math.PI * Math.pow(radius, 2) * cylinderLength;
        const sphereVolume = (4/3) * Math.PI * Math.pow(radius, 3);
        const volume = cylinderVolume + sphereVolume;
        return volume.toFixed(2) + ' m³';
      }
      break;
  }
  
  return "Calculate volume after calibration";
};

export const TankManagement = () => {
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<TankConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/tanks/config");
      setTanks(response.data.tanks || []);
    } catch (error: any) {
      console.error("Failed to fetch tanks:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load tank configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTank = () => {
    setSelectedTank(null);
    setConfigModalOpen(true);
  };

  const handleEditTank = (tank: TankConfig) => {
    setSelectedTank(tank);
    setConfigModalOpen(true);
  };

  const handleCalibrateTank = (tank: TankConfig) => {
    setSelectedTank(tank);
    setCalibrationModalOpen(true);
  };

  const handleDeleteTank = async (tankId: string) => {
    if (!confirm("Are you sure you want to delete this tank configuration?")) {
      return;
    }

    try {
      await api.delete(`/api/tanks/config/${tankId}`);
      toast({
        title: "Success",
        description: "Tank configuration deleted successfully",
      });
      fetchTanks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tank configuration",
        variant: "destructive",
      });
    }
  };

  const getTankShapeName = (shape: string) => {
    const shapes: { [key: string]: string } = {
      horizontal_cylinder: "Horizontal Cylinder",
      rectangular: "Rectangular",
      capsule: "Capsule",
      custom: "Custom"
    };
    return shapes[shape] || shape;
  };

  const getDimensionsText = (tank: TankConfig) => {
    const { dimensions, tankShape } = tank;
    
    switch (tankShape) {
      case "horizontal_cylinder":
        return `⌀${dimensions.diameter}m × ${dimensions.length}m`;
      case "rectangular":
        return `${dimensions.length}m × ${dimensions.width}m × ${dimensions.height}m`;
      case "capsule":
        return `⌀${dimensions.diameter}m × ${dimensions.length}m (Capsule)`;
      default:
        return "Custom dimensions";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading tank configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Tank Management"
        description="Configure and manage fuel storage tanks with certified calibration"
        actions={
          <Button onClick={handleCreateTank}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tank
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tanks.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tanks Configured</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first fuel storage tank configuration.
              </p>
              <Button onClick={handleCreateTank}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Tank
              </Button>
            </CardContent>
          </Card>
        ) : (
          tanks.map((tank) => (
            <Card key={tank._id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-600" />
                  {tank.tankName}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCalibrateTank(tank)}
                    title="Calibrate tank"
                  >
                    <Table className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditTank(tank)}
                    title="Edit tank"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <div className="font-medium">{tank.product}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <div className="font-medium">{tank.capacity.toLocaleString()} L</div>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Shape:</span>
                  <div className="font-medium">{getTankShapeName(tank.tankShape)}</div>
                  <div className="text-xs text-muted-foreground">
                    {getDimensionsText(tank)}
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Calibration:</span>
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {new Date(tank.calibrationDate).toLocaleDateString()}
                  </div>
                  {tank.lastCalibrationBy && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      by {tank.lastCalibrationBy}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {tank.calibrationTable?.length || 0} calibration points
                  </div>
                </div>

                {(!tank.calibrationTable || tank.calibrationTable.length === 0) && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    Calibration required
                  </div>
                )}

                {!tank.isActive && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    Inactive
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TankConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        tank={selectedTank}
        onSuccess={fetchTanks}
      />

      <CalibrationModal
        open={calibrationModalOpen}
        onOpenChange={setCalibrationModalOpen}
        tank={selectedTank}
        onSuccess={fetchTanks}
      />
    </div>
  );
};

export default TankManagement;