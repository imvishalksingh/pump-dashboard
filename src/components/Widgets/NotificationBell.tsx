import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockNotifications } from "@/data/mockData";

export const NotificationBell = () => {
  const unreadCount = mockNotifications.filter(n => n.status === "Unread").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <Badge variant="secondary">{unreadCount} new</Badge>
        </div>
        <ScrollArea className="h-80">
          <div className="p-4 space-y-4">
            {mockNotifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "text-sm space-y-1 pb-4 border-b last:border-0",
                  notification.status === "Unread" && "font-medium"
                )}
              >
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={notification.severity === "High" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {notification.type}
                  </Badge>
                  {notification.status === "Unread" && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <p className="text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" size="sm">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
