// components/Sales/SalesForm.tsx - UPDATED
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
import { Plus, Fuel, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { Badge } from "@/components/ui/badge";

interface Nozzle {
  _id: string;
  number: string;
  fuelType: string;
  pump: {
    name: string;
  };
}

interface SalesFormProps {
  onSuccess: () => void;
}

export const SalesForm = ({ onSuccess }: SalesFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [selectedNozzle, setSelectedNozzle] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nozzle: "",
    product: "",
    customer: "",
    liters: "",
    price: "",
    paymentMode: "Cash",
    fuelType: ""
  });

  useEffect(() => {
    fetchNozzles();
  }, []);

  const fetchNozzles = async () => {
    try {
      const response = await api.get("/api/nozzles");
      setNozzles(response.data);
    } catch (error) {
      console.error("Failed to fetch nozzles:", error);
    }
  };

  const handleNozzleChange = (nozzleId: string) => {
    setSelectedNozzle(nozzleId);
    const nozzle = nozzles.find(n => n._id === nozzleId);
    if (nozzle) {
      setFormData(prev => ({
        ...prev,
        nozzle: nozzleId,
        fuelType: nozzle.fuelType,
        product: nozzle.fuelType
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nozzle || !formData.liters || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        liters: parseFloat(formData.liters),
        price: parseFloat(formData.price),
        fuelType: formData.fuelType
      };

      await api.post("/api/sales", payload);
      
      toast({
        title: "Success",
        description: "Sale recorded successfully. Tank will be deducted upon auditor verification.",
      });

      setOpen(false);
      resetForm();
      onSuccess();
      
    } catch (error: any) {
      console.error("Error creating sale:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nozzle: "",
      product: "",
      customer: "",
      liters: "",
      price: "",
      paymentMode: "Cash",
      fuelType: ""
    });
    setSelectedNozzle("");
  };

  const calculateTotal = () => {
    const liters = parseFloat(formData.liters) || 0;
    const price = parseFloat(formData.price) || 0;
    return liters * price;
  };

  const selectedNozzleData = nozzles.find(n => n._id === selectedNozzle);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            Record New Sale
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nozzle">Nozzle *</Label>
            <Select value={selectedNozzle} onValueChange={handleNozzleChange}>
              <SelectTrigger id="nozzle">
                <SelectValue placeholder="Select nozzle" />
              </SelectTrigger>
              <SelectContent>
                {nozzles.map((nozzle) => (
                  <SelectItem key={nozzle._id} value={nozzle._id}>
                    {nozzle.number} - {nozzle.fuelType} ({nozzle.pump.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedNozzleData && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Fuel Type:</span>
                <Badge variant="outline" className="bg-blue-100">
                  {selectedNozzleData.fuelType}
                </Badge>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Tank will be automatically deducted when auditor verifies this sale
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liters">Liters *</Label>
              <Input 
                id="liters" 
                type="number" 
                placeholder="0.00" 
                step="0.01"
                value={formData.liters}
                onChange={(e) => setFormData({...formData, liters: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Liter (₹) *</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="0.00" 
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-green-800">Total Amount:</span>
              <span className="font-bold text-green-800 text-lg">
                ₹{calculateTotal().toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {formData.liters || 0}L × ₹{formData.price || 0} = ₹{calculateTotal().toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment">Payment Mode</Label>
            <Select 
              value={formData.paymentMode} 
              onValueChange={(value) => setFormData({...formData, paymentMode: value})}
            >
              <SelectTrigger id="payment">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.nozzle || !formData.liters || !formData.price}
            >
              {loading ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};