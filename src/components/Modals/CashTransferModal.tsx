import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CashTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CashTransferModal = ({ open, onClose, onSubmit }: CashTransferModalProps) => {
  const [formData, setFormData] = useState({
    shiftId: "",
    operator: "",
    amount: "",
    remarks: ""
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cash Transfer/Handover</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="shift">Shift</Label>
            <Select value={formData.shiftId} onValueChange={(value) => setFormData({ ...formData, shiftId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S001">Shift S001 - Rajesh Kumar</SelectItem>
                <SelectItem value="S003">Shift S003 - Priya Singh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="operator">Operator Name</Label>
            <Input
              id="operator"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              placeholder="Enter operator name"
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="350000"
            />
          </div>
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Any discrepancies or notes..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
