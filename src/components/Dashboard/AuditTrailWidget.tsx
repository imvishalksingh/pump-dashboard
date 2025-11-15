import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileEdit, UserCheck, Settings, TrendingUp } from "lucide-react";

const auditTrail = [
  {
    id: 1,
    action: "Price Updated",
    user: "Admin User",
    details: "Petrol price changed from ₹101.50 to ₹102.00",
    timestamp: "2024-01-15 14:30",
    type: "update",
  },
  {
    id: 2,
    action: "Stock Adjusted",
    user: "Manager",
    details: "Tank 2 calibration: +150 L added",
    timestamp: "2024-01-15 12:15",
    type: "adjustment",
  },
  {
    id: 3,
    action: "Shift Approved",
    user: "Auditor",
    details: "Morning shift verified and signed off",
    timestamp: "2024-01-15 10:00",
    type: "approval",
  },
  {
    id: 4,
    action: "User Created",
    user: "Admin User",
    details: "New nozzleman account: Rahul Verma",
    timestamp: "2024-01-14 16:45",
    type: "user",
  },
  {
    id: 5,
    action: "Report Generated",
    user: "System",
    details: "Daily sales report for 2024-01-14",
    timestamp: "2024-01-14 23:59",
    type: "report",
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "update":
      return <TrendingUp className="w-4 h-4" />;
    case "adjustment":
      return <Settings className="w-4 h-4" />;
    case "approval":
      return <UserCheck className="w-4 h-4" />;
    default:
      return <FileEdit className="w-4 h-4" />;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case "update":
      return "bg-primary/10 text-primary";
    case "adjustment":
      return "bg-warning/10 text-warning";
    case "approval":
      return "bg-success/10 text-success";
    default:
      return "bg-secondary/10 text-secondary";
  }
};

export const AuditTrailWidget = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Audit Trail</h3>
        <p className="text-sm text-muted-foreground mt-1">Recent system activities and changes</p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {auditTrail.map((item, index) => (
            <div key={item.id} className="relative">
              {index !== auditTrail.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
              )}
              <div className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColor(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.details}</p>
                  <Badge variant="outline" className="text-xs">
                    By {item.user}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
