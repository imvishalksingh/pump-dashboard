// components/Tank/QuickDipCalculator.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Droplet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface TankConfig {
  _id: string;
  tankName: string;
  product: string;
  capacity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  calibrationTable?: Array<{
    dipMM: number;
    volumeLiters: number;
  }>;
}

interface QuickDipCalculatorProps {
  onCalculationComplete?: (result: any) => void;
}

export const QuickDipCalculator = ({ onCalculationComplete }: QuickDipCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [fetchingTanks, setFetchingTanks] = useState(false);

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tank: "",
    dipReading: "",
  });

  const [result, setResult] = useState<{
    volumeLiters: number;
    tankName: string;
    product: string;
    capacity: number;
    remainingPercentage: string;
    calibrationPointsUsed: number;
  } | null>(null);

  // Fetch tank configurations
  useEffect(() => {
    const fetchTankConfigs = async () => {
      try {
        setFetchingTanks(true);
        const response = await api.get("/api/tanks/config");
        setTanks(response.data.tanks || []);
      } catch (error: any) {
        console.error("❌ Failed to fetch tank configurations:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load tank configurations",
          variant: "destructive",
        });
        setTanks([]);
      } finally {
        setFetchingTanks(false);
      }
    };

    if (open) {
      fetchTankConfigs();
      // Reset form when opening
      setFormData({ tank: "", dipReading: "" });
      setResult(null);
    }
  }, [open, toast]);

  const calculateQuantity = async () => {
    if (!formData.tank || !formData.dipReading) {
      toast({
        title: "Missing fields",
        description: "Please select a tank and enter dip reading",
        variant: "destructive",
      });
      return;
    }

    const dip = parseFloat(formData.dipReading);
    if (isNaN(dip) || dip < 0) {
      toast({
        title: "Invalid dip reading",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setCalculating(true);

    try {
      const response = await api.post("/api/tanks/config/calculate", {
        tankId: formData.tank,
        dipReading: dip
      });

      const calculationResult = {
        volumeLiters: response.data.volumeLiters || response.data.calculatedQuantity,
        tankName: response.data.tankName,
        product: response.data.product,
        capacity: response.data.capacity,
        remainingPercentage: response.data.remainingPercentage,
        calibrationPointsUsed: response.data.calibrationPointsUsed
      };

      setResult(calculationResult);

      // Callback if provided
      if (onCalculationComplete) {
        onCalculationComplete(calculationResult);
      }

      toast({
        title: "Calculation Complete",
        description: `Volume: ${calculationResult.volumeLiters.toLocaleString()}L`,
      });

    } catch (error: any) {
      console.error("❌ Error calculating quantity:", error);
      toast({
        title: "Calculation Error",
        description: error.response?.data?.message || "Failed to calculate quantity",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear result when changing inputs
    if (result) {
      setResult(null);
    }
  };

  const resetForm = () => {
    setFormData({
      tank: "",
      dipReading: "",
    });
    setResult(null);
  };

  const selectedTank = tanks.find(tank => tank._id === formData.tank);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calculator className="w-4 h-4 mr-2" />
          Quick Calculate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Quick Dip Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Tank Selection */}
          <div className="space-y-2">
            <Label htmlFor="calculator-tank">Select Tank</Label>
            <Select 
              value={formData.tank} 
              onValueChange={(value) => handleChange("tank", value)}
              disabled={fetchingTanks || tanks.length === 0}
            >
              <SelectTrigger id="calculator-tank">
                <SelectValue placeholder={
                  fetchingTanks ? "Loading tanks..." : 
                  tanks.length === 0 ? "No tanks available" : "Select tank"
                } />
              </SelectTrigger>
              <SelectContent>
                {tanks.map((tank) => (
                  <SelectItem key={tank._id} value={tank._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{tank.tankName}</span>
                      <span className="text-xs text-muted-foreground">
                        {tank.product} • {tank.capacity.toLocaleString()}L
                        {tank.calibrationTable && ` • ${tank.calibrationTable.length} cal points`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dip Reading */}
          <div className="space-y-2">
            <Label htmlFor="calculator-dip">Dip Reading (mm)</Label>
            <div className="flex gap-2">
              <Input 
                id="calculator-dip" 
                type="number"
                placeholder="Enter dip reading in millimeters"
                step="1"
                min="0"
                value={formData.dipReading}
                onChange={(e) => handleChange("dipReading", e.target.value)}
                disabled={!formData.tank}
              />
              <Button 
                type="button" 
                onClick={calculateQuantity}
                disabled={!formData.tank || !formData.dipReading || calculating}
                className="whitespace-nowrap"
              >
                {calculating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4" />
                )}
                <span className="ml-2">Calculate</span>
              </Button>
            </div>
            {selectedTank && (
              <p className="text-xs text-muted-foreground">
                Tank Height: {selectedTank.dimensions.height || 'N/A'}m • 
                Capacity: {selectedTank.capacity.toLocaleString()}L
              </p>
            )}
          </div>

          {/* Calculation Result */}
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-green-800 flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                Calculation Result
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tank:</span>
                  <div className="font-medium">{result.tankName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Product:</span>
                  <div className="font-medium">{result.product}</div>
                </div>
                
                <div className="col-span-2">
                  <span className="text-muted-foreground">Calculated Volume:</span>
                  <div className="text-lg font-bold text-green-700">
                    {result.volumeLiters.toLocaleString()} Liters
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Tank Level:</span>
                  <div className="font-medium">{result.remainingPercentage}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span>
                  <div className="font-medium">{result.capacity.toLocaleString()}L</div>
                </div>
              </div>

              {result.calibrationPointsUsed > 0 && (
                <p className="text-xs text-muted-foreground">
                  Using {result.calibrationPointsUsed} calibration points
                </p>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {result && (
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(result.volumeLiters.toString());
                  toast({
                    title: "Copied!",
                    description: "Volume copied to clipboard",
                  });
                }}
              >
                Copy Volume
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetForm}
              >
                New Calculation
              </Button>
            </div>
          )}

          {/* Information */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> This calculator uses the tank's calibration table for accurate volume calculation. 
              Results are based on certified calibration data.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};