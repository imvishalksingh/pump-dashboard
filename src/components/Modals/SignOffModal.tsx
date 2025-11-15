import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface SignOffModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const SignOffModal = ({ open, onClose, onSubmit }: SignOffModalProps) => {
  const [formData, setFormData] = useState({
    notes: "",
    confirmed: false
  });

  const handleSubmit = () => {
    if (!formData.confirmed) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Audit Sign Off</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Sign Off Summary</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Total Audits: 12</p>
              <p>• Discrepancies Found: 3</p>
              <p>• Resolved: 1</p>
              <p>• Pending: 2</p>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Sign Off Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any final remarks or observations..."
              rows={4}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm"
              checked={formData.confirmed}
              onCheckedChange={(checked) => setFormData({ ...formData, confirmed: checked as boolean })}
            />
            <label
              htmlFor="confirm"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that all audit items have been reviewed
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.confirmed}>
            Complete Sign Off
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
