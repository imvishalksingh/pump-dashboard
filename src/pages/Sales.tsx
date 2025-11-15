import { PageHeader } from "@/components/Shared/PageHeader";
import { SalesList } from "@/components/Sales/SalesList";
import { SalesForm } from "@/components/Sales/SalesForm";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

const Sales = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Management"
        description="View, filter, and record all fuel sales"
        actions={
          <>
            <Button variant="outline">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <SalesForm />
          </>
        }
      />
      <SalesList />
    </div>
  );
};

export default Sales;
