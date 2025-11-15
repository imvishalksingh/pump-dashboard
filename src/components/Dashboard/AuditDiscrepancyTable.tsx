import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const discrepancies = [
  {
    id: 1,
    date: "2024-01-15",
    type: "Stock Mismatch",
    product: "Diesel",
    expected: 5000,
    actual: 4850,
    difference: -150,
    severity: "high",
  },
  {
    id: 2,
    date: "2024-01-14",
    type: "Cash Variance",
    shift: "Morning Shift",
    expected: 125000,
    actual: 124700,
    difference: -300,
    severity: "medium",
  },
  {
    id: 3,
    date: "2024-01-13",
    type: "Meter Reading",
    nozzle: "Nozzle 2",
    expected: 12500,
    actual: 12480,
    difference: -20,
    severity: "low",
  },
];

export const AuditDiscrepancyTable = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Discrepancies Found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Items requiring investigation</p>
        </div>
        <Button variant="outline" size="sm">
          Export Report
        </Button>
      </div>

      <div className="space-y-3">
        {discrepancies.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{item.type}</p>
                  <Badge
                    variant={
                      item.severity === "high"
                        ? "destructive"
                        : item.severity === "medium"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      item.severity === "medium" ? "bg-warning/20 text-warning" : ""
                    }
                  >
                    {item.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.product || item.shift || item.nozzle}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-border">
              <div>
                <p className="text-muted-foreground">Expected</p>
                <p className="font-medium text-foreground">
                  {item.type === "Cash Variance" ? "₹" : ""}
                  {item.expected.toLocaleString()}
                  {item.type !== "Cash Variance" ? " L" : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Actual</p>
                <p className="font-medium text-foreground">
                  {item.type === "Cash Variance" ? "₹" : ""}
                  {item.actual.toLocaleString()}
                  {item.type !== "Cash Variance" ? " L" : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Difference</p>
                <p className="font-medium text-destructive">
                  {item.difference}
                  {item.type !== "Cash Variance" ? " L" : ""}
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full mt-3">
              Investigate
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
