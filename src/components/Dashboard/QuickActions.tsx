// components/Dashboard/QuickActions.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, BarChart3, Users } from "lucide-react";

export const QuickActions = () => {
  const actions = [
    { icon: Plus, label: "Add Pump", href: "/pumps", description: "Register new fuel pump" },
    { icon: DollarSign, label: "Update Price", href: "/pricing", description: "Change fuel rates" },
    { icon: BarChart3, label: "View Reports", href: "/reports", description: "Sales & analytics" },
    { icon: Users, label: "Manage Users", href: "/users", description: "Staff & permissions" },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex flex-col gap-2 hover:shadow-md transition-all text-center"
            asChild
          >
            <a href={action.href}>
              <action.icon className="h-5 w-5 mx-auto mb-1" />
              <div>
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
              </div>
            </a>
          </Button>
        ))}
      </div>
    </Card>
  );
};