// components/Modals/StockPurchaseModal.tsx
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
import { IndianRupee, Calculator, Minus } from "lucide-react";
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

export const StockPurchaseModal = ({ open, onOpenChange, onPurchaseAdded }: StockPurchaseModalProps) => {
  const [loading, setLoading] = useState(false);
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [fetchingTanks, setFetchingTanks] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    purchaseType: "fuel" as PurchaseType,
    
    // Common fields for all purchase types
    supplier: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    
    // Fuel Purchase fields (matches your FuelStock model)
    product: "",
    tank: "",
    purchaseQuantity: "",
    purchaseValue: "",
    ratePerLiter: "",
    vehicleNumber: "",
    density: "",
    
    // Tax breakdown fields (for VAT/GST)
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
    }
  }, [open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on purchase type
    let missingFields: string[] = [];
    
    const commonFields = ['supplier', 'invoiceNumber', 'invoiceDate'];
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
        // Fuel purchase - using your existing FuelStock model structure
        const selectedTank = tanks.find(tank => tank._id === formData.tank);
        payload = {
          ...payload,
          product: selectedTank?.product || "",
          tank: formData.tank,
          purchaseQuantity: parseFloat(formData.purchaseQuantity),
          purchaseValue: parseFloat(formData.purchaseValue),
          ratePerLiter: parseFloat(formData.ratePerLiter),
          vehicleNumber: formData.vehicleNumber,
          density: formData.density ? parseFloat(formData.density) : undefined,
          // Tax breakdown for VAT filing
          vat: parseFloat(formData.vat) || 0,
          otherCharges: parseFloat(formData.otherCharges) || 0
        };
      } else if (formData.purchaseType === "lube") {
        // Lube purchase - GST based
        payload = {
          ...payload,
          product: formData.lubeProductName,
          purchaseType: "lube",
          purchaseValue: parseFloat(formData.purchaseValue),
          taxableValue: parseFloat(formData.purchaseValue), // For GST calculation
          cgst: parseFloat(formData.cgst) || 0,
          sgst: parseFloat(formData.sgst) || 0,
          igst: parseFloat(formData.igst) || 0,
          discount: parseFloat(formData.discount) || 0
        };
      } else if (formData.purchaseType === "fixed-asset") {
        // Fixed asset purchase - GST based
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculations based on purchase type
    if (formData.purchaseType === "fuel") {
      if (field === "purchaseQuantity" || field === "ratePerLiter") {
        calculateFuelAmount();
      }
      if (field === "purchaseValue" || field === "vat" || field === "otherCharges") {
        calculateFuelTotal();
      }
    } else if (formData.purchaseType === "lube" || formData.purchaseType === "fixed-asset") {
      if (field === "purchaseValue" || field === "cgst" || field === "sgst" || field === "igst" || field === "discount") {
        calculateGSTTotal();
      }
    }

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

  // Calculate fuel amount from rate and quantity
  const calculateFuelAmount = () => {
    const purchaseQuantity = parseFloat(formData.purchaseQuantity) || 0;
    const ratePerLiter = parseFloat(formData.ratePerLiter) || 0;
    const amount = purchaseQuantity * ratePerLiter;
    
    if (!isNaN(amount)) {
      setFormData(prev => ({
        ...prev,
        purchaseValue: amount.toString()
      }));
      calculateFuelTotal();
    }
  };

  // Calculate fuel total value (VAT based)
  const calculateFuelTotal = () => {
    const purchaseValue = parseFloat(formData.purchaseValue) || 0;
    const vat = parseFloat(formData.vat) || 0;
    const otherCharges = parseFloat(formData.otherCharges) || 0;
    const totalValue = purchaseValue + vat + otherCharges;
    
    if (!isNaN(totalValue)) {
      setFormData(prev => ({
        ...prev,
        totalValue: totalValue.toString()
      }));
    }
  };

  // Calculate GST total value
  const calculateGSTTotal = () => {
    const purchaseValue = parseFloat(formData.purchaseValue) || 0;
    const cgst = parseFloat(formData.cgst) || 0;
    const sgst = parseFloat(formData.sgst) || 0;
    const igst = parseFloat(formData.igst) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    const totalValue = purchaseValue + cgst + sgst + igst - discount;
    
    if (!isNaN(totalValue)) {
      setFormData(prev => ({
        ...prev,
        totalValue: Math.max(0, totalValue).toString()
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      purchaseType: "fuel",
      supplier: "",
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
                  placeholder="Supplier name"
                  value={formData.supplier}
                  onChange={(e) => handleChange("supplier", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input 
                  id="invoiceNumber" 
                  placeholder="INV-2024-001"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleChange("invoiceNumber", e.target.value)}
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
                  onChange={(e) => handleChange("invoiceDate", e.target.value)}
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
                      onValueChange={(value) => handleChange("tank", value)}
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

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchaseQuantity">Purchase Quantity (L) *</Label>
                      <Input 
                        id="purchaseQuantity" 
                        type="number"
                        placeholder="2000"
                        value={formData.purchaseQuantity}
                        onChange={(e) => {
                          handleChange("purchaseQuantity", e.target.value);
                          calculateFuelAmount();
                        }}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ratePerLiter">Rate per Liter (₹) *</Label>
                      <Input 
                        id="ratePerLiter" 
                        type="number"
                        placeholder="95.50"
                        value={formData.ratePerLiter}
                        onChange={(e) => {
                          handleChange("ratePerLiter", e.target.value);
                          calculateFuelAmount();
                        }}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseValue">Purchase Value (₹) *</Label>
                      <Input 
                        id="purchaseValue" 
                        type="number"
                        placeholder="191000"
                        value={formData.purchaseValue}
                        onChange={(e) => handleChange("purchaseValue", e.target.value)}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Additional Fields for Fuel */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                      <Input 
                        id="vehicleNumber" 
                        placeholder="DL01AB1234"
                        value={formData.vehicleNumber}
                        onChange={(e) => handleChange("vehicleNumber", e.target.value)}
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
                        onChange={(e) => handleChange("density", e.target.value)}
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
                              onChange={(e) => handleChange("vat", e.target.value)}
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
                              onChange={(e) => handleChange("otherCharges", e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="border-t pt-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Purchase Value:</span>
                              <span>₹{parseFloat(formData.purchaseValue || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>VAT:</span>
                              <span>₹{parseFloat(formData.vat || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Other Charges:</span>
                              <span>₹{parseFloat(formData.otherCharges || "0").toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="border-t mt-2 pt-2">
                            <div className="flex justify-between items-center font-semibold text-lg">
                              <span>Total Value:</span>
                              <span className="text-green-600">₹{parseFloat(formData.totalValue || "0").toLocaleString()}</span>
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

            {/* Lube Purchase Fields */}
            {formData.purchaseType === "lube" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Lube Purchase Details (GST)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lubeProductName">Lube Product Name *</Label>
                    <Input 
                      id="lubeProductName" 
                      placeholder="e.g., Engine Oil, Gear Oil, Grease"
                      value={formData.lubeProductName}
                      onChange={(e) => handleChange("lubeProductName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="purchaseValue">Taxable Value (₹) *</Label>
                    <Input 
                      id="purchaseValue" 
                      type="number"
                      placeholder="50000"
                      value={formData.purchaseValue}
                      onChange={(e) => handleChange("purchaseValue", e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
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
                              onChange={(e) => handleChange("cgst", e.target.value)}
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
                              onChange={(e) => handleChange("sgst", e.target.value)}
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
                              onChange={(e) => handleChange("igst", e.target.value)}
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
                            onChange={(e) => handleChange("discount", e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="border-t pt-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Taxable Value:</span>
                              <span>₹{parseFloat(formData.purchaseValue || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>CGST:</span>
                              <span>₹{parseFloat(formData.cgst || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>SGST:</span>
                              <span>₹{parseFloat(formData.sgst || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>IGST:</span>
                              <span>₹{parseFloat(formData.igst || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                              <span>Discount:</span>
                              <span>- ₹{parseFloat(formData.discount || "0").toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="border-t mt-2 pt-2">
                            <div className="flex justify-between items-center font-semibold text-lg">
                              <span>Total Value:</span>
                              <span className="text-green-600">₹{parseFloat(formData.totalValue || "0").toLocaleString()}</span>
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
                  <h3 className="text-lg font-semibold mb-4">Fixed Asset Purchase Details (GST)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetName">Asset Name *</Label>
                      <Input 
                        id="assetName" 
                        placeholder="e.g., Air Compressor, Generator"
                        value={formData.assetName}
                        onChange={(e) => handleChange("assetName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assetCategory">Asset Category *</Label>
                      <Select 
                        value={formData.assetCategory} 
                        onValueChange={(value) => handleChange("assetCategory", value)}
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
                      onChange={(e) => handleChange("assetDescription", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="purchaseValue">Taxable Value (₹) *</Label>
                    <Input 
                      id="purchaseValue" 
                      type="number"
                      placeholder="100000"
                      value={formData.purchaseValue}
                      onChange={(e) => handleChange("purchaseValue", e.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
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
                              onChange={(e) => handleChange("cgst", e.target.value)}
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
                              onChange={(e) => handleChange("sgst", e.target.value)}
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
                              onChange={(e) => handleChange("igst", e.target.value)}
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
                            onChange={(e) => handleChange("discount", e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="border-t pt-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Taxable Value:</span>
                              <span>₹{parseFloat(formData.purchaseValue || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>CGST:</span>
                              <span>₹{parseFloat(formData.cgst || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>SGST:</span>
                              <span>₹{parseFloat(formData.sgst || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>IGST:</span>
                              <span>₹{parseFloat(formData.igst || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                              <span>Discount:</span>
                              <span>- ₹{parseFloat(formData.discount || "0").toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="border-t mt-2 pt-2">
                            <div className="flex justify-between items-center font-semibold text-lg">
                              <span>Total Value:</span>
                              <span className="text-green-600">₹{parseFloat(formData.totalValue || "0").toLocaleString()}</span>
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