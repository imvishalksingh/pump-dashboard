// pages/TankManagement.tsx - UPDATED
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Droplet, Calculator, AlertTriangle, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { TankConfigModal } from "@/components/Modals/TankConfigModal";
import { QuickDipCalculator } from "../pages/modules/QuickDipCalculator";

interface TankConfig {
  _id: string;
  tankName: string;
  product: "MS" | "HSD";
  capacity: number;
  isActive: boolean;
  lastCalibrationBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const TankManagement = () => {
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [configModalOpen, setConfigModalOpen] = useState(false);
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

  const getProductDetails = (product: "MS" | "HSD") => {
    const products = {
      "MS": { name: "Petrol (MS)", color: "text-green-600", bgColor: "bg-green-50" },
      "HSD": { name: "Diesel (HSD)", color: "text-blue-600", bgColor: "bg-blue-50" }
    };
    return products[product] || { name: product, color: "text-gray-600", bgColor: "bg-gray-50" };
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
        description="Configure and manage MS (Petrol) and HSD (Diesel) storage tanks with mathematical volume calculation"
        actions={
          <div className="flex gap-2">
            <QuickDipCalculator onCalculationComplete={fetchTanks} />
            <Button onClick={handleCreateTank}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tank
            </Button>
          </div>
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
          tanks.map((tank) => {
            const productDetails = getProductDetails(tank.product);
            return (
              <Card key={tank._id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Droplet className={`h-4 w-4 ${productDetails.color}`} />
                    {tank.tankName}
                  </CardTitle>
                  <div className="flex items-center gap-1">
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
                  <div className={`p-2 rounded-md ${productDetails.bgColor}`}>
                    <div className="text-sm font-medium text-center {productDetails.color}">
                      {productDetails.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-medium">{tank.capacity.toLocaleString()} L</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="font-medium">
                        {tank.isActive ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-amber-600">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Calculation:</span>
                    <div className="flex items-center gap-1 text-xs">
                      <Calculator className="h-3 w-3" />
                      {tank.product === "MS" ? "MS Formula" : "HSD Formula"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mathematical volume calculation
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {new Date(tank.updatedAt).toLocaleDateString()}
                    </div>
                    {tank.lastCalibrationBy && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        by {tank.lastCalibrationBy}
                      </div>
                    )}
                  </div>

                  {!tank.isActive && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      Inactive
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <QuickDipCalculator 
                      onCalculationComplete={fetchTanks}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTank(tank)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <TankConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        tank={selectedTank}
        onSuccess={fetchTanks}
      />
    </div>
  );
};

export default TankManagement;