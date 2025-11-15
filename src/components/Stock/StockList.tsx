import { DataTable } from "@/components/Shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockStock = [
  {
    tank: "Tank 1",
    product: "Petrol",
    capacity: 10000,
    available: 7500,
    status: "Normal",
  },
  {
    tank: "Tank 2",
    product: "Diesel",
    capacity: 15000,
    available: 12000,
    status: "Normal",
  },
  {
    tank: "Tank 3",
    product: "CNG",
    capacity: 8000,
    available: 2000,
    status: "Low",
  },
  {
    tank: "Tank 4",
    product: "Petrol",
    capacity: 10000,
    available: 8500,
    status: "Normal",
  },
];

export const StockList = () => {
  const columns = [
    {
      key: "tank",
      label: "Tank",
      render: (item: any) => (
        <span className="font-semibold">{item.tank}</span>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (item: any) => (
        <Badge variant="outline">{item.product}</Badge>
      ),
    },
    {
      key: "capacity",
      label: "Capacity (L)",
      render: (item: any) => item.capacity.toLocaleString(),
    },
    {
      key: "available",
      label: "Available (L)",
      render: (item: any) => item.available.toLocaleString(),
    },
    {
      key: "percentage",
      label: "Stock Level",
      render: (item: any) => {
        const percentage = (item.available / item.capacity) * 100;
        const color = percentage < 30 ? "bg-destructive" : "bg-primary";
        return (
          <div className="space-y-1">
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) => (
        <Badge
          className={
            item.status === "Low"
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success"
          }
        >
          {item.status}
        </Badge>
      ),
    },
  ];

  return <DataTable data={mockStock} columns={columns} />;
};
