import { PageHeader } from "@/components/Shared/PageHeader";
import { StockList } from "@/components/Stock/StockList";
import { StockAdjustment } from "@/components/Stock/StockAdjustment";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

const Stock = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Management"
        description="Monitor and manage fuel inventory across all tanks"
        actions={
          <>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <StockAdjustment />
          </>
        }
      />
      <StockList />
    </div>
  );
};

export default Stock;
