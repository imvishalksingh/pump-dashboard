// components/Tank/QuickDipCalculator.tsx - FIXED VERSION
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
import { Calculator, Droplet, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface TankConfig {
  _id: string;
  tankName: string;
  product: "MS" | "HSD";
  capacity: number;
  currentStock?: number;
  currentLevel?: number;
}

interface QuickDipCalculatorProps {
  onCalculationComplete?: (result: any) => void;
  selectedTank?: TankConfig | null; // ✅ NEW: Pre-selected tank
  className?: string;
}

export const QuickDipCalculator = ({ 
  onCalculationComplete,
  selectedTank = null,
  className = ""
}: QuickDipCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [tanks, setTanks] = useState<TankConfig[]>([]);

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
    formulaUsed: string;
    dipReading: number;
  } | null>(null);

  // ✅ FIXED: Auto-populate selected tank when modal opens
  useEffect(() => {
    if (open && selectedTank) {
      setFormData({
        tank: selectedTank._id,
        dipReading: ""
      });
      setResult(null);
    } else if (open) {
      setFormData({ tank: "", dipReading: "" });
      setResult(null);
    }
  }, [open, selectedTank]);

  // Fetch tank configurations
  useEffect(() => {
    const fetchTankConfigs = async () => {
      try {
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
      }
    };

    if (open && !selectedTank) {
      fetchTankConfigs();
    }
  }, [open, selectedTank, toast]);

  const calculateQuantity = async () => {
    if (!formData.tank || !formData.dipReading) {
      toast({
        title: "Missing fields",
        description: "Please enter dip reading",
        variant: "destructive",
      });
      return;
    }

    const dip = parseFloat(formData.dipReading);
    if (isNaN(dip) || dip < 0) {
      toast({
        title: "Invalid dip reading",
        description: "Please enter a valid positive number in centimeters",
        variant: "destructive",
      });
      return;
    }

    // Validate dip reading range
    if (dip > 200) {
      toast({
        title: "Unusual dip reading",
        description: "Dip reading seems unusually high. Please verify the measurement.",
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

      if (!response.data.success) {
        throw new Error(response.data.error || "Calculation failed");
      }

      const calculationResult = {
        volumeLiters: response.data.volumeLiters,
        tankName: response.data.tankName,
        product: response.data.product,
        capacity: response.data.capacity,
        remainingPercentage: response.data.remainingPercentage,
        formulaUsed: response.data.formulaUsed,
        dipReading: response.data.dipReading
      };

      setResult(calculationResult);

      if (onCalculationComplete) {
        onCalculationComplete(calculationResult);
      }

      toast({
        title: "Calculation Complete",
        description: `Volume: ${calculationResult.volumeLiters.toLocaleString()}L (${calculationResult.remainingPercentage}% full)`,
      });

    } catch (error: any) {
      console.error("❌ Error calculating quantity:", error);
      toast({
        title: "Calculation Error",
        description: error.response?.data?.message || error.message || "Failed to calculate quantity",
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

    if (result) {
      setResult(null);
    }
  };

  const resetForm = () => {
    if (selectedTank) {
      setFormData({
        tank: selectedTank._id,
        dipReading: "",
      });
    } else {
      setFormData({
        tank: "",
        dipReading: "",
      });
    }
    setResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.tank && formData.dipReading) {
      calculateQuantity();
    }
  };

  const selectedTankObj = tanks.find(tank => tank._id === formData.tank) || selectedTank;

  const getFormulaDescription = (product: "MS" | "HSD") => {
    return product === "HSD" 
      ? "HSD Formula: 671.8 constant"
      : "MS Formula: 496.8 constant";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Calculator className="w-4 h-4 mr-2" />
          Quick Calculate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Quick Dip Calculator
          </DialogTitle>
          {selectedTank && (
            <p className="text-sm text-muted-foreground mt-1">
              For: <span className="font-semibold">{selectedTank.tankName}</span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* ✅ AUTO-SELECTED TANK DISPLAY */}
          {formData.tank && selectedTankObj ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedTankObj.tankName}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTankObj.product} • Capacity: {selectedTankObj.capacity.toLocaleString()}L
                  </div>
                  {selectedTankObj.currentStock && (
                    <div className="text-xs text-green-600 mt-1">
                      Current Stock: {selectedTankObj.currentStock}L ({selectedTankObj.currentLevel}%)
                    </div>
                  )}
                </div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Selected
                </div>
              </div>
              <input type="hidden" name="tank" value={formData.tank} />
            </div>
          ) : (
            /* Manual tank selection if no pre-selected tank */
            <div className="space-y-2">
              <Label htmlFor="calculator-tank">Select Tank</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.tank} 
                onChange={(e) => handleChange("tank", e.target.value)}
                disabled={tanks.length === 0}
              >
                <option value="">Select tank</option>
                {tanks.map((tank) => (
                  <option key={tank._id} value={tank._id}>
                    {tank.tankName} - {tank.product} ({tank.capacity}L)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dip Reading */}
          <div className="space-y-2">
            <Label htmlFor="calculator-dip">Dip Reading (centimeters)</Label>
            <div className="flex gap-2">
              <Input 
                id="calculator-dip" 
                type="number"
                placeholder="Enter dip in cm (e.g., 138.60)"
                step="0.01"
                min="0"
                max="200"
                value={formData.dipReading}
                onChange={(e) => handleChange("dipReading", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!formData.tank || calculating}
              />
              <Button 
                type="button" 
                onClick={calculateQuantity}
                disabled={!formData.tank || !formData.dipReading || calculating}
                className="whitespace-nowrap min-w-[120px]"
              >
                {calculating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4" />
                )}
                <span className="ml-2">Calculate</span>
              </Button>
            </div>
            {selectedTankObj && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Product: {selectedTankObj.product} • Capacity: {selectedTankObj.capacity.toLocaleString()}L
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {getFormulaDescription(selectedTankObj.product as "MS" | "HSD")}
                </p>
              </div>
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
                
                <div>
                  <span className="text-muted-foreground">Dip Reading:</span>
                  <div className="font-medium">{result.dipReading} cm</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tank Level:</span>
                  <div className="font-medium">{result.remainingPercentage}%</div>
                </div>
                
                <div className="col-span-2">
                  <span className="text-muted-foreground">Calculated Volume:</span>
                  <div className="text-lg font-bold text-green-700">
                    {result.volumeLiters.toLocaleString()} Liters
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Using {result.formulaUsed}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};