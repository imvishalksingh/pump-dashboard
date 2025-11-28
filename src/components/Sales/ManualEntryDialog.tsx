// components/Sales/ManualEntryDialog.tsx - UPDATED
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, User, DollarSign, Fuel, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface Nozzleman {
  _id: string;
  name: string;
  employeeId: string;
}

interface ManualEntryDialogProps {
  onSuccess: () => void;
  nozzlemen: Nozzleman[];
}

export const ManualEntryDialog = ({ onSuccess, nozzlemen }: ManualEntryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nozzlemanId: "",
    date: new Date().toISOString().split('T')[0],
    cashSales: "",
    phonePeSales: "",
    posSales: "",
    creditSales: "",
    expenses: "",
    cashDeposit: "",
    fuelDispensed: "",
    notes: ""
  });

  // In ManualEntryDialog.tsx - Update the handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.nozzlemanId) {
    toast({
      title: "Error",
      description: "Please select a nozzleman",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    const payload = {
      nozzlemanId: formData.nozzlemanId,
      date: formData.date,
      cashSales: parseFloat(formData.cashSales) || 0,     // This will map to cashCollected
      phonePeSales: parseFloat(formData.phonePeSales) || 0,
      posSales: parseFloat(formData.posSales) || 0,
      creditSales: parseFloat(formData.creditSales) || 0,
      expenses: parseFloat(formData.expenses) || 0,
      cashDeposit: parseFloat(formData.cashDeposit) || 0,
      fuelDispensed: parseFloat(formData.fuelDispensed) || 0,
      notes: formData.notes
    };

    console.log("📤 Sending manual entry data:", payload);

    const response = await api.post("/api/nozzleman-sales/manual-entry", payload);
    
    toast({
      title: "Success",
      description: "Manual entry created successfully",
    });

    setOpen(false);
    resetForm();
    onSuccess();
    
  } catch (error: any) {
    console.error("❌ Error creating manual entry:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to create manual entry",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      nozzlemanId: "",
      date: new Date().toISOString().split('T')[0],
      cashSales: "",
      phonePeSales: "",
      posSales: "",
      creditSales: "",
      expenses: "",
      cashDeposit: "",
      fuelDispensed: "",
      notes: ""
    });
  };

  const calculateCashInHand = () => {
    const cashSales = parseFloat(formData.cashSales) || 0;
    const expenses = parseFloat(formData.expenses) || 0;
    const cashDeposit = parseFloat(formData.cashDeposit) || 0;
    return cashSales - expenses - cashDeposit;
  };

  const calculateTotalSales = () => {
    return (parseFloat(formData.cashSales) || 0) +
           (parseFloat(formData.phonePeSales) || 0) +
           (parseFloat(formData.posSales) || 0) +
           (parseFloat(formData.creditSales) || 0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Create Manual Sales Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nozzleman Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Nozzleman Details
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nozzleman">Nozzleman *</Label>
                <Select 
                  value={formData.nozzlemanId} 
                  onValueChange={(value) => setFormData({...formData, nozzlemanId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nozzleman" />
                  </SelectTrigger>
                  <SelectContent>
                    {nozzlemen.map((nozzleman) => (
                      <SelectItem key={nozzleman._id} value={nozzleman._id}>
                        {nozzleman.name} ({nozzleman.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="pl-10"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Sales Breakdown (₹)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashSales">Cash Sales</Label>
                <Input
                  id="cashSales"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cashSales}
                  onChange={(e) => setFormData({...formData, cashSales: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phonePeSales">PhonePe Sales</Label>
                <Input
                  id="phonePeSales"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.phonePeSales}
                  onChange={(e) => setFormData({...formData, phonePeSales: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posSales">POS Sales</Label>
                <Input
                  id="posSales"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.posSales}
                  onChange={(e) => setFormData({...formData, posSales: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditSales">Credit Sales</Label>
                <Input
                  id="creditSales"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.creditSales}
                  onChange={(e) => setFormData({...formData, creditSales: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Fuel and Financials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Fuel className="w-4 h-4" />
              Fuel & Financials
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelDispensed">Fuel Dispensed (L)</Label>
                <Input
                  id="fuelDispensed"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fuelDispensed}
                  onChange={(e) => setFormData({...formData, fuelDispensed: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses">Expenses (₹)</Label>
                <Input
                  id="expenses"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.expenses}
                  onChange={(e) => setFormData({...formData, expenses: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashDeposit">Cash Deposit (₹)</Label>
                <Input
                  id="cashDeposit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cashDeposit}
                  onChange={(e) => setFormData({...formData, cashDeposit: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Total Sales</p>
              <p className="text-lg font-bold text-green-600">
                ₹{calculateTotalSales().toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Cash in Hand</p>
              <p className={`text-lg font-bold ${
                calculateCashInHand() >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                ₹{calculateCashInHand().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes or remarks..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              disabled={loading || !formData.nozzlemanId || calculateTotalSales() === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Creating..." : "Create Manual Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};