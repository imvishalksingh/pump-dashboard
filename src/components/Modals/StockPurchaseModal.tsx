// components/Modals/StockPurchaseModal.tsx - COMPLETE FIXED VERSION
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
import { IndianRupee, Calculator, Minus, RefreshCw, Check, Droplet, Package, Building } from "lucide-react";
import api from "@/utils/api";

interface TankConfig {
  _id: string;
  tankName: string;
  product: string;
  capacity: number;
  currentStock?: number;
  currentLevel?: number;
}

interface StockPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseAdded: () => void;
  selectedTank?: TankConfig | null;
}

type PurchaseType = "fuel" | "lube" | "fixed-asset";
type FuelUnit = "L" | "KL";

export const StockPurchaseModal = ({ 
  open, 
  onOpenChange, 
  onPurchaseAdded,
  selectedTank = null 
}: StockPurchaseModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [fetchingTanks, setFetchingTanks] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    purchaseType: "fuel" as PurchaseType,
    fuelUnit: "L" as FuelUnit,
    
    // Common fields for all purchase types
    supplier: "Bharat Petroleum",
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
    lubeQuantity: "",
    lubeUnit: "L",
    lubeRate: "",
    
    // Fixed Asset Purchase fields
    assetName: "",
    assetCategory: "",
    assetDescription: "",
    assetQuantity: "1",
    assetRate: ""
  });

  // ✅ FIXED: Auto-populate selected tank when modal opens
  useEffect(() => {
    if (open) {
      if (selectedTank) {
        setFormData(prev => ({
          ...prev,
          tank: selectedTank._id,
          product: selectedTank.product,
          purchaseType: "fuel" // Auto-set to fuel purchase for tank
        }));
      } else {
        // Reset form if no selected tank
        resetForm();
      }
    }
  }, [open, selectedTank]);

  // Calculate totals whenever relevant fields change
  useEffect(() => {
    calculateTotals();
  }, [
    formData.purchaseValue,
    formData.vat,
    formData.cgst,
    formData.sgst,
    formData.igst,
    formData.otherCharges,
    formData.discount,
    formData.lubeQuantity,
    formData.lubeRate,
    formData.assetQuantity,
    formData.assetRate
  ]);

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
    }
  }, [open, toast]);

  // ✅ FIXED: Convert quantity based on unit
  const getQuantityInLiters = (quantity: string, unit: string = "L"): number => {
    const qty = parseFloat(quantity) || 0;
    return unit === "KL" ? qty * 1000 : qty;
  };

  const getDisplayQuantity = (liters: number, unit: string = "L"): string => {
    if (unit === "KL") {
      return (liters / 1000).toFixed(3);
    }
    return liters.toString();
  };

  // ✅ FIXED: Calculate totals based on purchase type
  const calculateTotals = () => {
    if (formData.purchaseType === "fuel") {
      calculateFuelTotals();
    } else if (formData.purchaseType === "lube") {
      calculateLubeTotals();
    } else if (formData.purchaseType === "fixed-asset") {
      calculateFixedAssetTotals();
    }
  };

  // ✅ FIXED: Fuel totals calculation
  const calculateFuelTotals = () => {
    const purchaseValue = parseFloat(formData.purchaseValue) || 0;
    const vat = parseFloat(formData.vat) || 0;
    const otherCharges = parseFloat(formData.otherCharges) || 0;
    const totalValue = purchaseValue + vat + otherCharges;

    setFormData(prev => ({
      ...prev,
      totalValue: totalValue.toFixed(2),
      // Auto-calculate rate per liter based on TOTAL VALUE (not purchase value)
      ratePerLiter: (parseFloat(prev.purchaseQuantity) > 0 && totalValue > 0) 
        ? (totalValue / getQuantityInLiters(prev.purchaseQuantity, prev.fuelUnit)).toFixed(2) 
        : prev.ratePerLiter
    }));
  };

  // ✅ FIXED: Lube totals calculation
  const calculateLubeTotals = () => {
    const lubeQuantity = parseFloat(formData.lubeQuantity) || 0;
    const lubeRate = parseFloat(formData.lubeRate) || 0;
    const taxableValue = lubeQuantity * lubeRate;
    const cgst = parseFloat(formData.cgst) || 0;
    const sgst = parseFloat(formData.sgst) || 0;
    const igst = parseFloat(formData.igst) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    const totalValue = taxableValue + cgst + sgst + igst - discount;
    
    setFormData(prev => ({
      ...prev,
      purchaseValue: taxableValue.toFixed(2),
      totalValue: Math.max(0, totalValue).toFixed(2)
    }));
  };

  // ✅ FIXED: Fixed Asset totals calculation
  const calculateFixedAssetTotals = () => {
    const assetQuantity = parseFloat(formData.assetQuantity) || 1;
    const assetRate = parseFloat(formData.assetRate) || 0;
    const taxableValue = assetQuantity * assetRate;
    const cgst = parseFloat(formData.cgst) || 0;
    const sgst = parseFloat(formData.sgst) || 0;
    const igst = parseFloat(formData.igst) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    const totalValue = taxableValue + cgst + sgst + igst - discount;
    
    setFormData(prev => ({
      ...prev,
      purchaseValue: taxableValue.toFixed(2),
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
    if (unit === formData.fuelUnit) return;
    
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
    
    const commonFields = ['invoiceNumber', 'invoiceDate'];
    missingFields = commonFields.filter(field => !formData[field as keyof typeof formData]);

    if (formData.purchaseType === "fuel") {
      const fuelFields = ['tank', 'purchaseQuantity', 'ratePerLiter'];
      missingFields = [...missingFields, ...fuelFields.filter(field => !formData[field as keyof typeof formData])];
    } else if (formData.purchaseType === "lube") {
      const lubeFields = ['lubeProductName', 'lubeQuantity', 'lubeRate'];
      missingFields = [...missingFields, ...lubeFields.filter(field => !formData[field as keyof typeof formData])];
    } else if (formData.purchaseType === "fixed-asset") {
      const assetFields = ['assetName', 'assetCategory', 'assetRate'];
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

    setLoading(true);

    try {
      let payload: any = {
        purchaseType: formData.purchaseType,
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        totalValue: parseFloat(formData.totalValue) || 0
      };

      if (formData.purchaseType === "fuel") {
        const selectedTankObj = tanks.find(tank => tank._id === formData.tank) || selectedTank;
        const quantityInLiters = getQuantityInLiters(formData.purchaseQuantity, formData.fuelUnit);
        
        // ✅ FIXED: Use TOTAL VALUE to calculate rate per liter
        const totalValue = parseFloat(formData.totalValue) || 0;
        const ratePerLiter = quantityInLiters > 0 ? totalValue / quantityInLiters : 0;
        
        payload = {
          ...payload,
          product: selectedTankObj?.product || "",
          tank: formData.tank,
          purchaseQuantity: quantityInLiters,
          purchaseValue: parseFloat(formData.purchaseValue) || 0,
          ratePerLiter: ratePerLiter,
          vehicleNumber: formData.vehicleNumber,
          density: formData.density ? parseFloat(formData.density) : undefined,
          vat: parseFloat(formData.vat) || 0,
          otherCharges: parseFloat(formData.otherCharges) || 0,
          fuelUnit: formData.fuelUnit
        };
      } else if (formData.purchaseType === "lube") {
        const taxableValue = parseFloat(formData.lubeQuantity) * parseFloat(formData.lubeRate);
        payload = {
          ...payload,
          product: formData.lubeProductName,
          purchaseType: "lube",
          purchaseQuantity: parseFloat(formData.lubeQuantity),
          purchaseValue: taxableValue,
          taxableValue: taxableValue,
          ratePerUnit: parseFloat(formData.lubeRate),
          cgst: parseFloat(formData.cgst) || 0,
          sgst: parseFloat(formData.sgst) || 0,
          igst: parseFloat(formData.igst) || 0,
          discount: parseFloat(formData.discount) || 0,
          unit: formData.lubeUnit
        };
      } else if (formData.purchaseType === "fixed-asset") {
        const taxableValue = parseFloat(formData.assetQuantity) * parseFloat(formData.assetRate);
        payload = {
          ...payload,
          purchaseType: "fixed-asset",
          assetName: formData.assetName,
          assetCategory: formData.assetCategory,
          assetDescription: formData.assetDescription,
          assetQuantity: parseFloat(formData.assetQuantity),
          purchaseValue: taxableValue,
          taxableValue: taxableValue,
          ratePerUnit: parseFloat(formData.assetRate),
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
    if (selectedTank) {
      setFormData({
        purchaseType: "fuel",
        fuelUnit: "L",
        supplier: "Bharat Petroleum",
        invoiceNumber: "",
        invoiceDate: new Date().toISOString().split('T')[0],
        product: selectedTank.product,
        tank: selectedTank._id,
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
        lubeQuantity: "",
        lubeUnit: "L",
        lubeRate: "",
        assetName: "",
        assetCategory: "",
        assetDescription: "",
        assetQuantity: "1",
        assetRate: ""
      });
    } else {
      setFormData({
        purchaseType: "fuel",
        fuelUnit: "L",
        supplier: "Bharat Petroleum",
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
        lubeQuantity: "",
        lubeUnit: "L",
        lubeRate: "",
        assetName: "",
        assetCategory: "",
        assetDescription: "",
        assetQuantity: "1",
        assetRate: ""
      });
    }
  };

  const selectedTankObj = tanks.find(tank => tank._id === formData.tank) || selectedTank;

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return `₹${numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ✅ FIXED: Manual calculation triggers with TOTAL VALUE
  const calculateFromQuantityAndRate = () => {
    const quantity = getQuantityInLiters(formData.purchaseQuantity, formData.fuelUnit);
    const rate = parseFloat(formData.ratePerLiter) || 0;
    
    if (quantity > 0 && rate > 0) {
      const purchaseValue = quantity * rate;
      // Calculate VAT as 10% of purchase value (if not set)
      const vat = parseFloat(formData.vat) || (purchaseValue * 0.10);
      const otherCharges = parseFloat(formData.otherCharges) || 0;
      const totalValue = purchaseValue + vat + otherCharges;
      
      setFormData(prev => ({
        ...prev,
        purchaseValue: purchaseValue.toFixed(2),
        vat: vat.toFixed(2),
        totalValue: totalValue.toFixed(2)
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
    const quantity = getQuantityInLiters(formData.purchaseQuantity, formData.fuelUnit);
    const totalValue = parseFloat(formData.totalValue) || 0;
    
    if (quantity > 0 && totalValue > 0) {
      const rate = totalValue / quantity;
      setFormData(prev => ({
        ...prev,
        ratePerLiter: rate.toFixed(2)
      }));
    } else {
      toast({
        title: "Cannot calculate",
        description: "Please enter both quantity and total value first",
        variant: "destructive",
      });
    }
  };

  const calculateQuantityFromRateAndValue = () => {
    const rate = parseFloat(formData.ratePerLiter) || 0;
    const totalValue = parseFloat(formData.totalValue) || 0;
    
    if (rate > 0 && totalValue > 0) {
      const quantity = totalValue / rate;
      const displayQuantity = formData.fuelUnit === "KL" ? (quantity / 1000).toFixed(3) : quantity.toString();
      setFormData(prev => ({
        ...prev,
        purchaseQuantity: displayQuantity
      }));
    } else {
      toast({
        title: "Cannot calculate",
        description: "Please enter both rate and total value first",
        variant: "destructive",
      });
    }
  };

  // Check if tank is pre-selected
  const isTankPreSelected = !!selectedTank;

  // ✅ FIXED: Purchase type icons
  const getPurchaseTypeIcon = (type: PurchaseType) => {
    switch(type) {
      case "fuel": return <Droplet className="h-5 w-5 text-blue-600" />;
      case "lube": return <Package className="h-5 w-5 text-orange-600" />;
      case "fixed-asset": return <Building className="h-5 w-5 text-purple-600" />;
      default: return <IndianRupee className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-green-600" />
            Record Purchase
            {selectedTank && formData.purchaseType === "fuel" && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                • For: <span className="font-semibold">{selectedTank.tankName}</span>
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {fetchingTanks ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <p>Loading configurations...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Purchase Type Selection - ALWAYS VISIBLE */}
            <div className="space-y-2">
              <Label htmlFor="purchaseType">Purchase Type *</Label>
              <Select 
                value={formData.purchaseType} 
                onValueChange={(value) => {
                  const newType = value as PurchaseType;
                  setFormData(prev => ({ 
                    ...prev, 
                    purchaseType: newType,
                    // If switching to fuel and no tank selected, reset tank
                    ...(newType === "fuel" && !isTankPreSelected && {
                      tank: "",
                      product: ""
                    })
                  }));
                }}
              >
                <SelectTrigger id="purchaseType" className="h-12">
                  <div className="flex items-center gap-2">
                    {getPurchaseTypeIcon(formData.purchaseType as PurchaseType)}
                    <SelectValue placeholder="Select purchase type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-600" />
                      <span>Fuel Purchase (VAT)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="lube">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span>Lube Purchase (GST)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed-asset">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-600" />
                      <span>Fixed Asset Purchase (GST)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AUTO-SELECTED TANK DISPLAY - Only for fuel purchases */}
            {isTankPreSelected && formData.purchaseType === "fuel" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800">{selectedTank?.tankName}</h3>
                      <div className="text-sm text-blue-600">
                        {selectedTank?.product} • Capacity: {selectedTank?.capacity.toLocaleString()}L
                        {selectedTank?.currentStock && (
                          <span className="ml-3">• Current: {selectedTank.currentStock}L ({selectedTank.currentLevel}%)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    AUTO-SELECTED
                  </div>
                </div>
                <input type="hidden" name="tank" value={formData.tank} />
                <input type="hidden" name="product" value={formData.product} />
              </div>
            )}

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
              
              </div>
              {isTankPreSelected && formData.purchaseType === "fuel" && (
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input 
                    id="vehicleNumber" 
                    placeholder="DL01AB1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleFieldChange("vehicleNumber", e.target.value)}
                  />
                </div>
              )}
            </div>
            

            <div className="grid grid-cols-2 gap-4">
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
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-600" />
                    Fuel Purchase Details (VAT)
                  </h3>
                  
                  {/* Manual tank selection ONLY if no pre-selected tank */}
                  {!isTankPreSelected && (
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
                      {selectedTankObj && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedTankObj.product} | Capacity: {selectedTankObj.capacity}L
                        </p>
                      )}
                    </div>
                  )}

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
                          title="Calculate quantity from rate and total value"
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
                          {getQuantityInLiters(formData.purchaseQuantity, formData.fuelUnit).toLocaleString()} L
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ratePerLiter">
                        Rate per Liter (₹) *
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={calculateRateFromQuantityAndValue}
                          title="Calculate rate from quantity and total value"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </Label>
                      <Input 
                        id="ratePerLiter" 
                        type="number"
                        placeholder="95.50"
                        value={formData.ratePerLiter}
                        onChange={(e) => handleFieldChange("ratePerLiter", e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseValue">
                        Purchase Value (₹)
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={calculateFromQuantityAndRate}
                          title="Calculate purchase value from quantity and rate"
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
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                

                  {/* Additional Fields for Fuel */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    
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

                  {/* ✅ FIXED: Fuel Value Breakdown */}
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
                            <p className="text-xs text-muted-foreground">
                              Typically 10-12% of purchase value
                            </p>
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
                            <p className="text-xs text-muted-foreground mt-1">
                              Total Value = Purchase Value + VAT + Other Charges
                            </p>
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

            {/* Lube Purchase Fields */}
            {formData.purchaseType === "lube" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    Lube Purchase Details (GST)
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lubeProductName">Lube Product Name *</Label>
                    <Input 
                      id="lubeProductName" 
                      placeholder="e.g., Engine Oil, Gear Oil, Grease"
                      value={formData.lubeProductName}
                      onChange={(e) => handleFieldChange("lubeProductName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="lubeQuantity">Quantity (L) *</Label>
                      <Input 
                        id="lubeQuantity" 
                        type="number"
                        placeholder="200"
                        value={formData.lubeQuantity}
                        onChange={(e) => handleFieldChange("lubeQuantity", e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lubeRate">Rate per Liter (₹) *</Label>
                      <Input 
                        id="lubeRate" 
                        type="number"
                        placeholder="500"
                        value={formData.lubeRate}
                        onChange={(e) => handleFieldChange("lubeRate", e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lubeUnit">Unit</Label>
                      <Select 
                        value={formData.lubeUnit} 
                        onValueChange={(value) => handleFieldChange("lubeUnit", value)}
                      >
                        <SelectTrigger id="lubeUnit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Liters (L)</SelectItem>
                          <SelectItem value="KL">Kiloliters (KL)</SelectItem>
                          <SelectItem value="Kg">Kilograms (Kg)</SelectItem>
                          <SelectItem value="Tin">Tin</SelectItem>
                          <SelectItem value="Drum">Drum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Lube Value Breakdown */}
                  <Card className="mt-4">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Lube Value Breakdown - GST Filing
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cgst">CGST (₹)</Label>
                            <Input 
                              id="cgst" 
                              type="number"
                              placeholder="4500"
                              value={formData.cgst}
                              onChange={(e) => handleFieldChange("cgst", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sgst">SGST (₹)</Label>
                            <Input 
                              id="sgst" 
                              type="number"
                              placeholder="4500"
                              value={formData.sgst}
                              onChange={(e) => handleFieldChange("sgst", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="igst">IGST (₹)</Label>
                            <Input 
                              id="igst" 
                              type="number"
                              placeholder="0"
                              value={formData.igst}
                              onChange={(e) => handleFieldChange("igst", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount" className="flex items-center">
                            <Minus className="h-4 w-4 mr-1 text-red-500" />
                            Discount (₹)
                          </Label>
                          <Input 
                            id="discount" 
                            type="number"
                            placeholder="1000"
                            value={formData.discount}
                            onChange={(e) => handleFieldChange("discount", e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="border-t pt-2">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span>Taxable Value:</span>
                              <span className="font-medium">{formatCurrency(parseFloat(formData.lubeQuantity) * parseFloat(formData.lubeRate))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>CGST:</span>
                              <span className="font-medium">{formatCurrency(formData.cgst)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>SGST:</span>
                              <span className="font-medium">{formatCurrency(formData.sgst)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>IGST:</span>
                              <span className="font-medium">{formatCurrency(formData.igst)}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                              <span>Discount:</span>
                              <span>- {formatCurrency(formData.discount)}</span>
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

            {/* Fixed Asset Purchase Fields */}
            {formData.purchaseType === "fixed-asset" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    Fixed Asset Purchase Details (GST)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetName">Asset Name *</Label>
                      <Input 
                        id="assetName" 
                        placeholder="e.g., Air Compressor, Generator"
                        value={formData.assetName}
                        onChange={(e) => handleFieldChange("assetName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assetCategory">Asset Category *</Label>
                      <Select 
                        value={formData.assetCategory} 
                        onValueChange={(value) => handleFieldChange("assetCategory", value)}
                      >
                        <SelectTrigger id="assetCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="machinery">Machinery</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="computer">Computer Equipment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="assetDescription">Asset Description</Label>
                    <Input 
                      id="assetDescription" 
                      placeholder="Brief description of the asset"
                      value={formData.assetDescription}
                      onChange={(e) => handleFieldChange("assetDescription", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetQuantity">Quantity *</Label>
                      <Input 
                        id="assetQuantity" 
                        type="number"
                        placeholder="1"
                        value={formData.assetQuantity}
                        onChange={(e) => handleFieldChange("assetQuantity", e.target.value)}
                        required
                        min="1"
                        step="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assetRate">Rate per Unit (₹) *</Label>
                      <Input 
                        id="assetRate" 
                        type="number"
                        placeholder="100000"
                        value={formData.assetRate}
                        onChange={(e) => handleFieldChange("assetRate", e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Fixed Asset Value Breakdown */}
                  <Card className="mt-4">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Fixed Asset Value Breakdown - GST Filing
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cgst">CGST (₹)</Label>
                            <Input 
                              id="cgst" 
                              type="number"
                              placeholder="9000"
                              value={formData.cgst}
                              onChange={(e) => handleFieldChange("cgst", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sgst">SGST (₹)</Label>
                            <Input 
                              id="sgst" 
                              type="number"
                              placeholder="9000"
                              value={formData.sgst}
                              onChange={(e) => handleFieldChange("sgst", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="igst">IGST (₹)</Label>
                            <Input 
                              id="igst" 
                              type="number"
                              placeholder="0"
                              value={formData.igst}
                              onChange={(e) => handleFieldChange("igst", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount" className="flex items-center">
                            <Minus className="h-4 w-4 mr-1 text-red-500" />
                            Discount (₹)
                          </Label>
                          <Input 
                            id="discount" 
                            type="number"
                            placeholder="5000"
                            value={formData.discount}
                            onChange={(e) => handleFieldChange("discount", e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="border-t pt-2">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span>Taxable Value:</span>
                              <span className="font-medium">{formatCurrency(parseFloat(formData.assetQuantity) * parseFloat(formData.assetRate))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>CGST:</span>
                              <span className="font-medium">{formatCurrency(formData.cgst)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>SGST:</span>
                              <span className="font-medium">{formatCurrency(formData.sgst)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>IGST:</span>
                              <span className="font-medium">{formatCurrency(formData.igst)}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                              <span>Discount:</span>
                              <span>- {formatCurrency(formData.discount)}</span>
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