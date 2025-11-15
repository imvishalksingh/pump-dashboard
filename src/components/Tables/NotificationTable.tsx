import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/data/mockData";

interface NotificationTableProps {
  notifications: Notification[];
  onRowClick: (notification: Notification) => void;
}

export const NotificationTable = ({ notifications, onRowClick }: NotificationTableProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow 
            key={notification.id} 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onRowClick(notification)}
          >
            <TableCell>{new Date(notification.date).toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant="outline">{notification.type}</Badge>
            </TableCell>
            <TableCell className="font-medium">{notification.message}</TableCell>
            <TableCell>
              <Badge variant={getSeverityColor(notification.severity) as any}>
                {notification.severity}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {notification.status === "Unread" && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
                {notification.status}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
