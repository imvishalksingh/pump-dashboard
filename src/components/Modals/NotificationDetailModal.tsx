import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/data/mockData";

interface NotificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export const NotificationDetailModal = ({ open, onClose, notification }: NotificationDetailModalProps) => {
  if (!notification) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Notification Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{notification.type}</Badge>
            <Badge variant={getSeverityColor(notification.severity) as any}>
              {notification.severity} Priority
            </Badge>
            {notification.status === "Unread" && (
              <Badge variant="secondary">Unread</Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Module</p>
            <p className="font-medium">{notification.module}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date & Time</p>
            <p className="font-medium">{new Date(notification.date).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Message</p>
            <div className="bg-muted p-4 rounded-md">
              <p>{notification.message}</p>
            </div>
          </div>
          {notification.type === "Critical" && (
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                ⚠️ Immediate Action Required
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                This is a critical notification that requires immediate attention.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
