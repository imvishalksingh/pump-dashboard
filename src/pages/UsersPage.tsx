import { PageHeader } from "@/components/Shared/PageHeader";
import { UserList } from "@/components/Users/UserList";
import { UserForm } from "@/components/Users/UserForm";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all staff roles and permissions"
        actions={
          <>
            <Button variant="outline">
              <Filter className="w-4 h-4" />
              Filter by Role
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <UserForm />
          </>
        }
      />
      <UserList />
    </div>
  );
};

export default UsersPage;
