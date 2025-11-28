// components/Stock/StockAdjustment.tsx - FIXED
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Calculator, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
  dipFormula: string;
}

interface StockAdjustmentProps {
  onAdjustmentAdded: () => void;
}

export const StockAdjustment = ({ onAdjustmentAdded }: StockAdjustmentProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fetchingTanks, setFetchingTanks] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    product: "",
    tank: "",
    dipReading: "",
    calculatedQuantity: "",
    quantity: "",
    reason: "Daily Update",
    adjustmentType: "",
    customReason: ""
  });

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      console.log("🔐 StockAdjustment Auth Check:", {
        hasToken: !!token,
        tokenLength: token?.length,
        hasUser: !!user,
        user: user ? JSON.parse(user) : null
      });
    };
    
    checkAuth();
  }, []);

  // Fetch tank configurations with PROXY paths
  useEffect(() => {
    const fetchTankConfigs = async () => {
      try {
        setFetchingTanks(true);
        console.log('🔄 Fetching tank configurations via proxy...');
        
        const response = await api.get("/api/tanks/config");
        console.log('✅ Tanks response via proxy:', response.data);
        
        setTanks(response.data.tanks || []);
        setIsAdmin(response.data.isAdmin || false);
      } catch (error: any) {
        console.error("❌ Failed to fetch tank configurations:", error);
        console.log("Error details:", {
          status: error.response?.status,
          message: error.response?.data?.message,
          headers: error.config?.headers
        });
        
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
    }
  }, [open, toast]);

  // Calculate quantity with PROXY path - FIXED ERROR HANDLING
  const calculateQuantityFromDip = async (dipReading: string) => {
    if (!tanks || tanks.length === 0 || !formData.tank) {
      console.log("❌ Missing tanks or tank selection");
      return;
    }
    
    const dip = parseFloat(dipReading);
    if (isNaN(dip)) {
      console.log("❌ Invalid dip reading:", dipReading);
      return;
    }

    try {
      console.log('🔄 Calculating quantity for dip:', dip, 'tank:', formData.tank);
      
      const response = await api.post("/api/tanks/config/calculate", {
        tankId: formData.tank,
        dipReading: dip
      });

      console.log('✅ Calculation API Response:', response.data);

      const calculatedQuantity = response.data.calculatedQuantity || response.data.volumeLiters;
      
      console.log('🔍 Extracted calculatedQuantity:', calculatedQuantity);
      
      if (calculatedQuantity === undefined || calculatedQuantity === null) {
        console.error("❌ No calculated quantity in response:", response.data);
        toast({
          title: "Calculation Error",
          description: "No calculated quantity returned from server",
          variant: "destructive",
        });
        return;
      }

      const calculatedQuantityStr = parseFloat(calculatedQuantity).toFixed(2);
      const quantityStr = parseFloat(calculatedQuantity).toFixed(2);

      console.log('📊 Setting form data:', {
        calculatedQuantity: calculatedQuantityStr,
        quantity: quantityStr
      });

      setFormData(prev => ({
        ...prev,
        calculatedQuantity: calculatedQuantityStr,
        quantity: quantityStr
      }));

    } catch (error: any) {
      console.error("❌ Error calculating quantity:", error);
      console.log("Error response:", error.response?.data);
      
      toast({
        title: "Calculation Error",
        description: error.response?.data?.message || "Failed to calculate quantity",
        variant: "destructive",
      });
    }
  };

  // Submit stock adjustment with PROXY path
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.tank || !formData.dipReading || !formData.quantity) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const adjustmentType = isAdmin ? formData.adjustmentType : "daily_update";
    setLoading(true);

    try {
      console.log('🔄 Submitting stock adjustment via proxy...');

      const payload = {
        tank: formData.tank,
        adjustmentType: adjustmentType,
        quantity: parseFloat(formData.quantity) || 0,
        reason: formData.reason === "Other" ? formData.customReason : formData.reason,
        dipReading: parseFloat(formData.dipReading) || 0,
        calculatedQuantity: parseFloat(formData.calculatedQuantity) || 0
      };

      console.log('📦 Sending payload:', payload);

      const response = await api.post("/api/stock/adjustment", payload);

      console.log('✅ Stock adjustment success via proxy:', response.data);

      toast({
        title: "Success",
        description: response.data.message,
      });

      resetForm();
      setOpen(false);
      onAdjustmentAdded();

    } catch (error: any) {
      console.error("❌ Failed to record stock adjustment:", error);
      console.log("Error response:", error.response?.data);
      
      toast({
        title: "Error",
        description: error.response?.data?.error || error.response?.data?.message || "Failed to record stock update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "dipReading" && value && formData.tank) {
      calculateQuantityFromDip(value);
    }

    if (field === "tank" && value) {
      const selectedTank = tanks?.find(tank => tank._id === value);
      if (selectedTank) {
        setFormData(prev => ({
          ...prev,
          product: selectedTank.product
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      product: "",
      tank: "",
      dipReading: "",
      calculatedQuantity: "",
      quantity: "",
      reason: "Daily Update",
      adjustmentType: "",
      customReason: ""
    });
  };

  // FIX: Add safe access to selectedTank with default dimensions
  const selectedTank = tanks?.find(tank => tank._id === formData.tank);
  
  // Safe dimensions with defaults
  const safeDimensions = {
    height: selectedTank?.dimensions?.height || 0,
    length: selectedTank?.dimensions?.length || 0,
    width: selectedTank?.dimensions?.width || 0
  };

  // Safe dip formula
  const safeDipFormula = selectedTank?.dipFormula || "Standard Formula";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Daily Stock Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Daily Stock Update</DialogTitle>
        </DialogHeader>
        
        {fetchingTanks ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading tank configurations...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Tank Selection */}
            <div className="space-y-2">
              <Label htmlFor="tank">Select Tank *</Label>
              <Select 
                value={formData.tank} 
                onValueChange={(value) => handleChange("tank", value)}
                disabled={tanks.length === 0}
              >
                <SelectTrigger id="tank">
                  <SelectValue placeholder={
                    tanks.length === 0 ? "No tanks available" : "Select tank"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map((tank) => (
                    <SelectItem key={tank._id} value={tank._id}>
                      {tank.tankName} - {tank.product} ({tank.capacity}L)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tanks.length === 0 && (
                <p className="text-xs text-destructive">
                  No tank configurations found. Please contact administrator.
                </p>
              )}
            </div>

            {/* Auto-populated Product */}
            {formData.product && (
              <div className="space-y-2">
                <Label>Product</Label>
                <Input 
                  value={formData.product}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-selected based on tank
                </p>
              </div>
            )}

            {/* Dip Reading */}
            <div className="space-y-2">
              <Label htmlFor="dipReading">Dip Reading (cm) *</Label>
              <div className="flex gap-2">
                <Input 
                  id="dipReading" 
                  type="number"
                  placeholder="Enter dip reading in cm"
                  step="0.1"
                  value={formData.dipReading}
                  onChange={(e) => handleChange("dipReading", e.target.value)}
                  required
                  disabled={!formData.tank}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="whitespace-nowrap"
                  onClick={() => formData.dipReading && calculateQuantityFromDip(formData.dipReading)}
                  disabled={!formData.tank || !formData.dipReading}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calculate
                </Button>
              </div>
              {/* FIXED: Use safe dimensions and dip formula */}
              {selectedTank && (
                <p className="text-xs text-muted-foreground">
                  Tank Height: {safeDimensions.height}cm | 
                  Formula: {safeDipFormula}
                </p>
              )}
            </div>

            {/* Calculated Quantity - SAFE RENDER */}
            {formData.calculatedQuantity && (
              <div className="space-y-2">
                <Label htmlFor="calculatedQuantity">Calculated Quantity</Label>
                <Input 
                  id="calculatedQuantity" 
                  value={`${formData.calculatedQuantity} L`}
                  disabled
                  className="bg-green-50 border-green-200"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated based on dip reading and tank dimensions
                </p>
              </div>
            )}

            {/* Quantity Field */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (L) *</Label>
              <Input 
                id="quantity" 
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                required
              />
            </div>

            {/* Reason for Adjustment */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Adjustment *</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value) => handleChange("reason", value)}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily Update">Daily Update</SelectItem>
                  <SelectItem value="Inventory Correction">Inventory Correction</SelectItem>
                  <SelectItem value="Theft/Loss">Theft/Loss</SelectItem>
                  <SelectItem value="Evaporation">Evaporation</SelectItem>
                  <SelectItem value="Measurement Error">Measurement Error</SelectItem>
                  <SelectItem value="Tank Calibration">Tank Calibration</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional notes for "Other" reason */}
            {formData.reason === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Additional Notes *</Label>
                <Textarea
                  id="customReason"
                  placeholder="Please specify the reason for adjustment..."
                  rows={2}
                  value={formData.customReason}
                  onChange={(e) => handleChange("customReason", e.target.value)}
                  required
                />
              </div>
            )}

            {/* Adjustment Type (Admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="adjustmentType">Adjustment Type (Admin Only)</Label>
                <Select 
                  value={formData.adjustmentType} 
                  onValueChange={(value) => handleChange("adjustmentType", value)}
                >
                  <SelectTrigger id="adjustmentType">
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="addition">Addition</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Regular additions are done via purchases. Deductions via sales.
                </p>
              </div>
            )}

            {/* Non-admin message */}
            {!isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Standard Daily Update</p>
                    <p className="text-xs mt-1">
                      Addition and Deduction adjustments require admin approval. 
                      This entry will be recorded as a daily stock level update.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Information box */}
            {(formData.dipReading && formData.quantity) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  This will update {formData.product} stock to <strong>{formData.quantity} L</strong>
                  {formData.reason && ` due to: ${formData.reason === "Other" ? formData.customReason : formData.reason}`}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || tanks.length === 0}>
                {loading ? "Processing..." : "Record Daily Update"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};