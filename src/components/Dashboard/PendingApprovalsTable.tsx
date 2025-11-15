import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

const pendingApprovals = [
  {
    id: 1,
    type: "Shift Summary",
    staff: "Amit Singh",
    shift: "Night Shift",
    amount: 245600,
    date: "2024-01-15",
    status: "pending",
  },
  {
    id: 2,
    type: "Stock Adjustment",
    staff: "Manager",
    reason: "Tank Calibration",
    adjustment: "-50 L",
    date: "2024-01-15",
    status: "pending",
  },
  {
    id: 3,
    type: "Price Change",
    staff: "Admin",
    product: "Petrol",
    newPrice: "₹102.50/L",
    date: "2024-01-14",
    status: "pending",
  },
];

export const PendingApprovalsTable = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Pending Approvals</h3>
        <p className="text-sm text-muted-foreground mt-1">Items requiring your action</p>
      </div>

      <div className="space-y-3">
        {pendingApprovals.map((approval) => (
          <div
            key={approval.id}
            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{approval.type}</p>
                  <Badge variant="secondary" className="bg-warning/20 text-warning">
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">By {approval.staff}</p>
              </div>
              <p className="text-xs text-muted-foreground">{approval.date}</p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="text-sm">
                {approval.type === "Shift Summary" && (
                  <span className="text-foreground">Amount: ₹{approval.amount.toLocaleString()}</span>
                )}
                {approval.type === "Stock Adjustment" && (
                  <span className="text-foreground">Adjustment: {approval.adjustment}</span>
                )}
                {approval.type === "Price Change" && (
                  <span className="text-foreground">New Price: {approval.newPrice}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default" className="bg-success hover:bg-success/90">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
