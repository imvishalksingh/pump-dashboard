// components/Modals/NozzlemanFormModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface NozzlemanFormData {
  name: string;
  mobile: string;
  shift: string;
  status: string;
  email?: string;
  certifications?: string[];
}

interface NozzlemanFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NozzlemanFormData) => void;
  initialData?: Partial<NozzlemanFormData> & { _id?: string }; // Make initialData match form data structure
}

export const NozzlemanFormModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData 
}: NozzlemanFormModalProps) => {
  const [formData, setFormData] = useState<NozzlemanFormData>({
    name: "",
    mobile: "",
    shift: "Morning",
    status: "Active",
    email: "",
    certifications: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        mobile: initialData.mobile || "",
        shift: initialData.shift || "Morning",
        status: initialData.status || "Active",
        email: initialData.email || "",
        certifications: initialData.certifications || []
      });
    } else {
      setFormData({
        name: "",
        mobile: "",
        shift: "Morning",
        status: "Active",
        email: "",
        certifications: []
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?._id ? "Edit Nozzleman" : "Add New Nozzleman"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Shift</Label>
            <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData?._id ? "Update" : "Create"} Nozzleman
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};