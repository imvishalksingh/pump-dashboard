// components/Modals/StockPurchaseModal.tsx - FIXED SUPPLIER NAME
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Calculator, Minus, RefreshCw } from "lucide-react";
import api from "@/utils/api";

interface TankConfig {
  _id: string;
  tankName: string;
  product: string;
  capacity: number;
}

interface StockPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseAdded: () => void;
}

type PurchaseType = "fuel" | "lube" | "fixed-asset";
type FuelUnit = "L" | "KL";

export const StockPurchaseModal = ({ open, onOpenChange, onPurchaseAdded }: StockPurchaseModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [fetchingTanks, setFetchingTanks] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    purchaseType: "fuel" as PurchaseType,
    fuelUnit: "L" as FuelUnit,
    
    // Common fields for all purchase types
    supplier: "Bharat Petroleum", // Changed to Bharat Petroleum
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    
    // Fuel Purchase fields
    product: "",
    tank: "",
    purchaseQuantity: "",
    purchaseValue: "",
    ratePerLiter: "",
    vehicleNumber: "",
    density: "",
    
    // Tax breakdown fields
    vat: "",
    cgst: "",
    sgst: "",
    igst: "",
    otherCharges: "",
    discount: "",
    totalValue: "",
    
    // Lube Purchase additional fields
    lubeProductName: "",
    
    // Fixed Asset Purchase fields
    assetName: "",
    assetCategory: "",
    assetDescription: ""
  });

  // Fetch tank configurations
  useEffect(() => {
    const fetchTankConfigs = async () => {
      try {
        setFetchingTanks(true);
        const response = await api.get("/api/tanks/config");
        setTanks(response.data.tanks || []);
      } catch (error) {
        console.error("Failed to fetch tank configurations:", error);
        toast({
          title: "Error",
          description: "Failed to load tank configurations",
          variant: "destructive",
        });
        setTanks([]);
      } finally {
        setFetchingTanks(false);
      }
    };

    if (open) {
      fetchTankConfigs();
      resetForm();
    }
  }, [open, toast]);

  // Calculate totals only for tax fields, not for the main calculation fields
  useEffect(() => {
    calculateTotals();
  }, [
    formData.purchaseValue,
    formData.vat,
    formData.cgst,
    formData.sgst,
    formData.igst,
    formData.otherCharges,
    formData.discount
  ]);

  // Convert quantity based on unit
  const getQuantityInLiters = (quantity: string): number => {
    const qty = parseFloat(quantity) || 0;
    return formData.fuelUnit === "KL" ? qty * 1000 : qty;
  };

  const getDisplayQuantity = (liters: number): string => {
    if (formData.fuelUnit === "KL") {
      return (liters / 1000).toFixed(3);
    }
    return liters.toString();
  };

  const calculateTotals = () => {
    if (formData.purchaseType === "fuel") {
      calculateFuelTotals();
    } else if (formData.purchaseType === "lube" || formData.purchaseType === "fixed-asset") {
      calculateGSTTotals();
    }
  };

  const calculateFuelTotals = () => {
    const purchaseValue = parseFloat(formData.purchaseValue) || 0;
    const vat = parseFloat(formData.vat) || 0;
    const otherCharges = parseFloat(formData.otherCharges) || 0;
    const totalValue = purchaseValue + vat + otherCharges;

    setFormData(prev => ({
      ...prev,
      totalValue: totalValue.toFixed(2)
    }));
  };

  const calculateGSTTotals = () => {
    const purchaseValue = parseFloat(formData.purchaseValue) || 0;
    const cgst = parseFloat(formData.cgst) || 0;
    const sgst = parseFloat(formData.sgst) || 0;
    const igst = parseFloat(formData.igst) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    const totalValue = purchaseValue + cgst + sgst + igst - discount;
    
    setFormData(prev => ({
      ...prev,
      totalValue: Math.max(0, totalValue).toFixed(2)
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-select product when tank is selected
    if (field === "tank" && value) {
      const selectedTank = tanks.find(tank => tank._id === value);
      if (selectedTank) {
        setFormData(prev => ({
          ...prev,
          product: selectedTank.product
        }));
      }
    }
  };

  const handleUnitChange = (unit: FuelUnit) => {
    if (unit === formData.fuelUnit) return; // No change needed
    
    const currentQuantity = parseFloat(formData.purchaseQuantity) || 0;
    const currentRate = parseFloat(formData.ratePerLiter) || 0;
    
    let newQuantity = currentQuantity;
    let newRate = currentRate;

    if (formData.fuelUnit === "L" && unit === "KL") {
      // Converting from L to KL: quantity ÷ 1000, rate × 1000
      newQuantity = currentQuantity / 1000;
      newRate = currentRate * 1000;
    } else if (formData.fuelUnit === "KL" && unit === "L") {
      // Converting from KL to L: quantity × 1000, rate ÷ 1000
      newQuantity = currentQuantity * 1000;
      newRate = currentRate / 1000;
    }

    setFormData(prev => ({
      ...prev,
      fuelUnit: unit,
      purchaseQuantity: newQuantity > 0 ? newQuantity.toFixed(3) : prev.purchaseQuantity,
      ratePerLiter: newRate > 0 ? newRate.toFixed(2) : prev.ratePerLiter
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on purchase type
    let missingFields: string[] = [];
    
    const commonFields = ['invoiceNumber', 'invoiceDate']; // Removed supplier from validation since it's fixed
    missingFields = commonFields.filter(field => !formData[field as keyof typeof formData]);

    if (formData.purchaseType === "fuel") {
      const fuelFields = ['tank', 'purchaseQuantity', 'purchaseValue', 'ratePerLiter'];
      missingFields = [...missingFields, ...fuelFields.filter(field => !formData[field as keyof typeof formData])];
    } else if (formData.purchaseType === "lube") {
      const lubeFields = ['lubeProductName', 'purchaseValue', 'totalValue'];
      missingFields = [...missingFields, ...lubeFields.filter(field => !formData[field as keyof typeof formData])];
    } else if (formData.purchaseType === "fixed-asset") {
      const assetFields = ['assetName', 'assetCategory', 'totalValue'];
      missingFields = [...missingFields, ...assetFields.filter(field => !formData[field as keyof typeof formData])];
    }
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate fuel calculations
    if (formData.purchaseType === "fuel") {
      const quantityInLiters = getQuantityInLiters(formData.purchaseQuantity);
      const ratePerLiter = parseFloat(formData.ratePerLiter);
      const purchaseValue = parseFloat(formData.purchaseValue);
      
      // Adjust rate calculation based on current unit
      let expectedValue = 0;
      if (formData.fuelUnit === "L") {
        expectedValue = quantityInLiters * ratePerLiter;
      } else {
        // For KL, rate is already per KL, so no conversion needed
        expectedValue = parseFloat(formData.purchaseQuantity) * ratePerLiter;
      }
      
      // Allow small rounding differences
      if (Math.abs(purchaseValue - expectedValue) > 1) {
        toast({
          title: "Calculation mismatch",
          description: `Purchase value (${formatCurrency(purchaseValue)}) doesn't match quantity × rate (${formatCurrency(expectedValue)})`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      let payload: any = {
        purchaseType: formData.purchaseType,
        supplier: formData.supplier, // This will always be "Bharat Petroleum"
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        totalValue: parseFloat(formData.totalValue) || 0
      };

      if (formData.purchaseType === "fuel") {
        const selectedTank = tanks.find(tank => tank._id === formData.tank);
        const quantityInLiters = getQuantityInLiters(formData.purchaseQuantity);
        
        // Convert rate back to per liter for storage
        let ratePerLiter = parseFloat(formData.ratePerLiter);
        if (formData.fuelUnit === "KL") {
          ratePerLiter = ratePerLiter / 1000; // Convert from per KL to per liter
        }
        
        payload = {
          ...payload,
          product: selectedTank?.product || "",
          tank: formData.tank,
          purchaseQuantity: quantityInLiters, // Always store in liters
          purchaseValue: parseFloat(formData.purchaseValue),
          ratePerLiter: ratePerLiter, // Always store as per liter
          vehicleNumber: formData.vehicleNumber,
          density: formData.density ? parseFloat(formData.density) : undefined,
          vat: parseFloat(formData.vat) || 0,
          otherCharges: parseFloat(formData.otherCharges) || 0,
          fuelUnit: formData.fuelUnit // Store the unit used for input
        };
      } else if (formData.purchaseType === "lube") {
        payload = {
          ...payload,
          product: formData.lubeProductName,
          purchaseType: "lube",
          purchaseValue: parseFloat(formData.purchaseValue),
          taxableValue: parseFloat(formData.purchaseValue),
          cgst: parseFloat(formData.cgst) || 0,
          sgst: parseFloat(formData.sgst) || 0,
          igst: parseFloat(formData.igst) || 0,
          discount: parseFloat(formData.discount) || 0
        };
      } else if (formData.purchaseType === "fixed-asset") {
        payload = {
          ...payload,
          purchaseType: "fixed-asset",
          assetName: formData.assetName,
          assetCategory: formData.assetCategory,
          assetDescription: formData.assetDescription,
          taxableValue: parseFloat(formData.purchaseValue) || 0,
          cgst: parseFloat(formData.cgst) || 0,
          sgst: parseFloat(formData.sgst) || 0,
          igst: parseFloat(formData.igst) || 0,
          discount: parseFloat(formData.discount) || 0
        };
      }

      await api.post("/api/stock/purchase", payload);

      toast({
        title: "Success",
        description: "Purchase recorded successfully",
      });

      resetForm();
      onOpenChange(false);
      onPurchaseAdded();

    } catch (error: any) {
      console.error("Failed to record purchase:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record purchase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      purchaseType: "fuel",
      fuelUnit: "L",
      supplier: "Bharat Petroleum", // Reset to Bharat Petroleum
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      product: "",
      tank: "",
      purchaseQuantity: "",
      purchaseValue: "",
      ratePerLiter: "",
      vehicleNumber: "",
      density: "",
      vat: "",
      cgst: "",
      sgst: "",
      igst: "",
      otherCharges: "",
      discount: "",
      totalValue: "",
      lubeProductName: "",
      assetName: "",
      assetCategory: "",
      assetDescription: ""
    });
  };

  const selectedTank = tanks.find(tank => tank._id === formData.tank);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return `₹${numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Manual calculation triggers - ONLY calculate when manually triggered
  const calculateFromQuantityAndRate = () => {
    const quantity = parseFloat(formData.purchaseQuantity) || 0;
    const rate = parseFloat(formData.ratePerLiter) || 0;
    
    if (quantity > 0 && rate > 0) {
      const purchaseValue = quantity * rate;
      setFormData(prev => ({
        ...prev,
        purchaseValue: purchaseValue.toFixed(2)
      }));
    } else {
      toast({
        title: "Cannot calculate",
        description: "Please enter both quantity and rate first",
        variant: "destructive",
      });
    }
  };

  const calculateRateFromQuantityAndValue = () => {
    const quantity = parseFloat(formData.purchaseQuantity) || 0;
    const purchaseValue = parseFloat(formData.purchaseValue) || 0;
    
    if (quantity > 0 && purchaseValue > 0) {
      const rate = purchaseValue / quantity;
      setFormData(prev => ({
        ...prev,
        ratePerLiter: rate.toFixed(2)
      }));
    } else {
      toast({
        title: "Cannot calculate",
        description: "Please enter both quantity and purchase value first",
        variant: "destructive",
      });
    }
  };

  const calculateQuantityFromRateAndValue = () => {
    const rate = parseFloat(formData.ratePerLiter) || 0;
    const purchaseValue = parseFloat(formData.purchaseValue) || 0;
    
    if (rate > 0 && purchaseValue > 0) {
      const quantity = purchaseValue / rate;
      setFormData(prev => ({
        ...prev,
        purchaseQuantity: quantity.toFixed(3)
      }));
    } else {
      toast({
        title: "Cannot calculate",
        description: "Please enter both rate and purchase value first",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Purchase</DialogTitle>
        </DialogHeader>
        
        {fetchingTanks ? (
          <div className="flex items-center justify-center py-8">
            <p>Loading tank configurations...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Purchase Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="purchaseType">Purchase Type *</Label>
              <Select 
                value={formData.purchaseType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, purchaseType: value as PurchaseType }))}
              >
                <SelectTrigger id="purchaseType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel Purchase (VAT)</SelectItem>
                  <SelectItem value="lube">Lube Purchase (GST)</SelectItem>
                  <SelectItem value="fixed-asset">Fixed Asset Purchase (GST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Input 
                  id="supplier" 
                  value="Bharat Petroleum"
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Supplier is fixed as Bharat Petroleum
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input 
                  id="invoiceNumber" 
                  placeholder="INV-2024-001"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input 
                  id="invoiceDate" 
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Fuel Purchase Fields */}
            {formData.purchaseType === "fuel" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Fuel Purchase Details (VAT)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tank">Select Tank *</Label>
                    <Select 
                      value={formData.tank} 
                      onValueChange={(value) => handleFieldChange("tank", value)}
                      disabled={tanks.length === 0}
                    >
                      <SelectTrigger id="tank">
                        <SelectValue placeholder={tanks.length === 0 ? "No tanks available" : "Select tank"} />
                      </SelectTrigger>
                      <SelectContent>
                        {tanks.map((tank) => (
                          <SelectItem key={tank._id} value={tank._id}>
                            {tank.tankName} - {tank.product} ({tank.capacity}L)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTank && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedTank.product} | Capacity: {selectedTank.capacity}L
                      </p>
                    )}
                  </div>

                  {/* Unit Selection */}
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="fuelUnit">Fuel Unit</Label>
                    <Select 
                      value={formData.fuelUnit} 
                      onValueChange={(value) => handleUnitChange(value as FuelUnit)}
                    >
                      <SelectTrigger id="fuelUnit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Liters (L)</SelectItem>
                        <SelectItem value="KL">Kiloliters (KL)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {formData.fuelUnit === "KL" ? "1 KL = 1000 L" : "1 L = 0.001 KL"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchaseQuantity">
                        Purchase Quantity ({formData.fuelUnit}) *
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={calculateQuantityFromRateAndValue}
                          title="Calculate quantity from rate and value"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </Label>
                      <Input 
                        id="purchaseQuantity" 
                        type="number"
                        placeholder={formData.fuelUnit === "KL" ? "2.000" : "2000"}
                        value={formData.purchaseQuantity}
                        onChange={(e) => handleFieldChange("purchaseQuantity", e.target.value)}
                        required
                        min="0"
                        step={formData.fuelUnit === "KL" ? "0.001" : "1"}
                      />
                      {formData.fuelUnit === "KL" && formData.purchaseQuantity && (
                        <p className="text-xs text-muted-foreground">
                          {getQuantityInLiters(formData.purchaseQuantity).toLocaleString()} L
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ratePerLiter">
                        Rate per {formData.fuelUnit} (₹) *
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={calculateRateFromQuantityAndValue}
                          title="Calculate rate from quantity and value"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </Label>
                      <Input 
                        id="ratePerLiter" 
                        type="number"
                        placeholder={formData.fuelUnit === "KL" ? "95000" : "95.50"}
                        value={formData.ratePerLiter}
                        onChange={(e) => handleFieldChange("ratePerLiter", e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseValue">
                        Purchase Value (₹) *
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={calculateFromQuantityAndRate}
                          title="Calculate value from quantity and rate"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </Label>
                      <Input 
                        id="purchaseValue" 
                        type="number"
                        placeholder="191000"
                        value={formData.purchaseValue}
                        onChange={(e) => handleFieldChange("purchaseValue", e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Calculation Info */}
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-700">
                      <strong>Manual Calculation:</strong> Enter any two values and click the refresh icon to calculate the third value.
                      <br />
                      <strong>Unit Conversion:</strong> All values automatically convert when switching between L and KL.
                    </p>
                  </div>

                  {/* Additional Fields for Fuel */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                      <Input 
                        id="vehicleNumber" 
                        placeholder="DL01AB1234"
                        value={formData.vehicleNumber}
                        onChange={(e) => handleFieldChange("vehicleNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="density">Density (kg/L)</Label>
                      <Input 
                        id="density" 
                        type="number"
                        placeholder="0.75"
                        step="0.001"
                        value={formData.density}
                        onChange={(e) => handleFieldChange("density", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Fuel Value Breakdown */}
                  <Card className="mt-4">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Fuel Value Breakdown (VAT)
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="vat">VAT (₹)</Label>
                            <Input 
                              id="vat" 
                              type="number"
                              placeholder="28650"
                              value={formData.vat}
                              onChange={(e) => handleFieldChange("vat", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="otherCharges">Other Charges (₹)</Label>
                            <Input 
                              id="otherCharges" 
                              type="number"
                              placeholder="5000"
                              value={formData.otherCharges}
                              onChange={(e) => handleFieldChange("otherCharges", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="border-t pt-2">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span>Purchase Value:</span>
                              <span className="font-medium">{formatCurrency(formData.purchaseValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>VAT:</span>
                              <span className="font-medium">{formatCurrency(formData.vat)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Other Charges:</span>
                              <span className="font-medium">{formatCurrency(formData.otherCharges)}</span>
                            </div>
                          </div>
                          <div className="border-t mt-2 pt-2">
                            <div className="flex justify-between items-center font-semibold text-lg">
                              <span>Total Value:</span>
                              <span className="text-green-600">{formatCurrency(formData.totalValue)}</span>
                            </div>
                          </div>
                          <Input 
                            type="hidden"
                            value={formData.totalValue}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Rest of the code for Lube and Fixed Asset purchases remains the same */}
            {/* ... */}

            <div className="flex justify-end gap-2 mt-6 border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Recording..." : "Record Purchase"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};