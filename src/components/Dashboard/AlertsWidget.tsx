// components/Dashboard/AlertsWidget.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

export const AlertsWidget = () => {
  const alerts = [
    {
      type: 'info',
      message: 'All systems operational',
      description: 'No critical issues detected',
      time: 'Just now'
    },
    {
      type: 'warning', 
      message: 'Tank 2 stock at 22%',
      description: 'Consider refueling soon',
      time: '2 hours ago'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-foreground">System Alerts</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {alerts.length} Active
        </Badge>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            alert.type === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              {alert.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              ) : (
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
              </div>
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </div>
        )}
      </div>
    </Card>
  );
};