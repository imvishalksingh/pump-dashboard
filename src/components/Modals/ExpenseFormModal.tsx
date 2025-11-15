import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RealExpense } from "@/types/expense";

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: RealExpense | null;
}

export const ExpenseFormModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData 
}: ExpenseFormModalProps) => {
  const [formData, setFormData] = useState({
    category: "Maintenance",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Edit mode - populate with existing data
        setFormData({
          category: initialData.category,
          amount: initialData.amount.toString(),
          description: initialData.description,
          date: new Date(initialData.date).toISOString().split('T')[0]
        });
      } else {
        // Add mode - reset form
        setFormData({
          category: "Maintenance",
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: "Maintenance",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Salary">Salary</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Supplies">Supplies</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              min="1"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter expense description..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.amount || !formData.category}
          >
            {loading ? "Saving..." : (initialData ? "Update Expense" : "Add Expense")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};