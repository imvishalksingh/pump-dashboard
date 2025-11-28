// components/Modals/CalibrationModal.tsx - UPDATED
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CalibrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tank: any;
  onSuccess: () => void;
}

export const CalibrationModal = ({ 
  open, 
  onOpenChange, 
  tank, 
  onSuccess 
}: CalibrationModalProps) => {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Volume Calculation Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Mathematical Formulas</h4>
            <p className="text-sm text-blue-700">
              This tank uses mathematical formulas for volume calculation:
              <br />
              <strong>MS (Petrol):</strong> 496.8 * 10000.0 * (acos(x) - (x * sqrt(1 - x * x))) / 1000.0
              <br />
              <strong>HSD (Diesel):</strong> 671.8 * 10000.0 * (acos(x) - (x * sqrt(1 - x * x))) / 1000.0
              <br />
              where x = 1 - (dipReading / 100.0)
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};