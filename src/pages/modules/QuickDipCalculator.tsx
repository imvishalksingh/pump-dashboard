// components/Tank/QuickDipCalculator.tsx - FULLY FIXED
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
import { Calculator, Droplet, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface TankConfig {
  _id: string;
  tankName: string;
  product: "MS" | "HSD";
  capacity: number;
}

interface QuickDipCalculatorProps {
  onCalculationComplete?: (result: any) => void;
}

export const QuickDipCalculator = ({ onCalculationComplete }: QuickDipCalculatorProps) => {
  const [open, setOpen] = useState(false);
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
    formulaUsed: string;
    dipReading: number;
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
        description: "Please enter a valid positive number in centimeters",
        variant: "destructive",
      });
      return;
    }

    // Validate dip reading range (typical range for these formulas)
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

      // Callback if provided
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.tank && formData.dipReading) {
      calculateQuantity();
    }
  };

  const selectedTank = tanks.find(tank => tank._id === formData.tank);

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
        <Button variant="outline" size="sm">
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
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dip Reading - UPDATED TO CENTIMETERS */}
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
            {selectedTank && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Product: {selectedTank.product} • Capacity: {selectedTank.capacity.toLocaleString()}L
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {getFormulaDescription(selectedTank.product)}
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
                
                <div className="col-span-2">
                  <span className="text-muted-foreground">Tank Capacity:</span>
                  <div className="font-medium">{result.capacity.toLocaleString()}L</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Using {result.formulaUsed}
              </div>
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
                onClick={() => {
                  const resultText = `Tank: ${result.tankName}\nDip: ${result.dipReading}cm\nVolume: ${result.volumeLiters.toLocaleString()}L\nLevel: ${result.remainingPercentage}%`;
                  navigator.clipboard.writeText(resultText);
                  toast({
                    title: "Copied!",
                    description: "Full result copied to clipboard",
                  });
                }}
              >
                Copy All
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

          {/* Information Panel */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-blue-800">Calculation Method</p>
                <p className="text-xs text-blue-700">
                  This calculator uses mathematical formulas based on tank type:
                </p>
                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li><strong>MS (Petrol):</strong> 496.8 × formula</li>
                  <li><strong>HSD (Diesel):</strong> 671.8 × formula</li>
                </ul>
                <p className="text-xs text-blue-700 mt-1">
                  Formula: constant × 10000 × (acos(1 - dip/100) - ((1 - dip/100) × √(1 - (1 - dip/100)²))) / 1000
                </p>
              </div>
            </div>
          </div>

          {/* Example Values */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800">Example Values (HSD Tank)</p>
                <div className="text-xs text-amber-700 grid grid-cols-2 gap-1 mt-1">
                  <span>138.60 cm → 15,607 L</span>
                  <span>124.90 cm → 13,863 L</span>
                  <span>112.40 cm → 12,214 L</span>
                  <span>99.60 cm → 10,499 L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};