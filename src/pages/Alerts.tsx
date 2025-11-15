import { PageHeader } from "@/components/Shared/PageHeader";
import { AlertsList } from "@/components/Alerts/AlertsList";
import { Button } from "@/components/ui/button";
import { Filter, CheckCheck } from "lucide-react";

const Alerts = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Notifications"
        description="View and manage all system alerts and notifications"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Type
            </Button>
            <Button variant="outline">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        }
      />
      <AlertsList />
    </div>
  );
};

export default Alerts;