import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AuditDiscrepancy } from "@/data/mockData";

interface AuditDetailModalProps {
  open: boolean;
  onClose: () => void;
  discrepancy: AuditDiscrepancy | null;
}

export const AuditDetailModal = ({ open, onClose, discrepancy }: AuditDetailModalProps) => {
  if (!discrepancy) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Discrepancy Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(discrepancy.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Module</p>
              <Badge variant="outline">{discrepancy.module}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issue Type</p>
              <p className="font-medium">{discrepancy.issueType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Severity</p>
              <Badge variant={getSeverityColor(discrepancy.severity) as any}>
                {discrepancy.severity}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge>{discrepancy.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned To</p>
              <p className="font-medium">{discrepancy.assignedTo || "Unassigned"}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Details</p>
            <div className="bg-muted p-4 rounded-md">
              <p>{discrepancy.details}</p>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm font-medium">Investigation Notes</p>
            <p className="text-sm text-muted-foreground mt-1">
              This discrepancy is currently under review. Additional information will be added as the investigation progresses.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
