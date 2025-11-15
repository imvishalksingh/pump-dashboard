import { useState } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationTable } from "@/components/Tables/NotificationTable";
import { NotificationDetailModal } from "@/components/Modals/NotificationDetailModal";
import { mockNotifications } from "@/data/mockData";

export default function NotificationsPage() {
  const [notifications] = useState(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState("All");

  const filteredNotifications = filter === "All" ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="System Notifications & Alerts" description="View all system notifications and alerts" />
      
      <div className="flex gap-2">
        {["All", "Critical", "Info", "Maintenance", "Stock", "Audit"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>{f}</Button>
        ))}
      </div>

      <Card><CardContent className="pt-6"><NotificationTable notifications={filteredNotifications} onRowClick={setSelectedNotification} /></CardContent></Card>
      <NotificationDetailModal open={!!selectedNotification} onClose={() => setSelectedNotification(null)} notification={selectedNotification} />
    </div>
  );
}
