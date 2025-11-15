import { Card } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    type: "error",
    title: "Low Stock Alert",
    message: "Tank 2 (Diesel) is below 20% capacity",
    time: "5 min ago",
  },
  {
    id: 2,
    type: "warning",
    title: "Shift Pending Closure",
    message: "Morning shift needs approval from manager",
    time: "15 min ago",
  },
  {
    id: 3,
    type: "info",
    title: "Price Update Available",
    message: "New fuel rates received from headquarters",
    time: "1 hour ago",
  },
  {
    id: 4,
    type: "success",
    title: "System Check Complete",
    message: "All pumps are functioning normally",
    time: "2 hours ago",
  },
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case "error":
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case "success":
      return <CheckCircle className="w-5 h-5 text-success" />;
    default:
      return <Info className="w-5 h-5 text-primary" />;
  }
};

export const AlertsWidget = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Alerts & Notifications</h3>
        <p className="text-sm text-muted-foreground mt-1">Recent system alerts</p>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "flex gap-3 p-4 rounded-lg border transition-colors",
              alert.type === "error" && "bg-destructive/5 border-destructive/20",
              alert.type === "warning" && "bg-warning/5 border-warning/20",
              alert.type === "success" && "bg-success/5 border-success/20",
              alert.type === "info" && "bg-primary/5 border-primary/20"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              <span className="text-xs text-muted-foreground mt-2 block">{alert.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
