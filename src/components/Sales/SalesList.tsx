import { DataTable } from "@/components/Shared/DataTable";
import { Badge } from "@/components/ui/badge";

const mockSales = [
  {
    id: "S001",
    date: "2025-01-10 14:32",
    nozzle: "Nozzle 1",
    product: "Petrol",
    liters: 25.5,
    total: 2550,
    paymentMode: "Cash",
  },
  {
    id: "S002",
    date: "2025-01-10 14:28",
    nozzle: "Nozzle 3",
    product: "Diesel",
    liters: 40.2,
    total: 3618,
    paymentMode: "Card",
  },
  {
    id: "S003",
    date: "2025-01-10 14:15",
    nozzle: "Nozzle 5",
    product: "CNG",
    liters: 15.0,
    total: 1125,
    paymentMode: "UPI",
  },
  {
    id: "S004",
    date: "2025-01-10 14:05",
    nozzle: "Nozzle 2",
    product: "Petrol",
    liters: 30.0,
    total: 3000,
    paymentMode: "Cash",
  },
  {
    id: "S005",
    date: "2025-01-10 13:58",
    nozzle: "Nozzle 4",
    product: "Diesel",
    liters: 55.8,
    total: 5022,
    paymentMode: "Card",
  },
];

export const SalesList = () => {
  const columns = [
    {
      key: "id",
      label: "Sale ID",
    },
    {
      key: "date",
      label: "Date & Time",
    },
    {
      key: "nozzle",
      label: "Nozzle",
    },
    {
      key: "product",
      label: "Product",
      render: (item: any) => (
        <Badge variant="outline" className="font-medium">
          {item.product}
        </Badge>
      ),
    },
    {
      key: "liters",
      label: "Liters",
      render: (item: any) => `${item.liters.toFixed(2)} L`,
    },
    {
      key: "total",
      label: "Total (₹)",
      render: (item: any) => (
        <span className="font-semibold">₹{item.total.toFixed(2)}</span>
      ),
    },
    {
      key: "paymentMode",
      label: "Payment",
      render: (item: any) => {
        const colors = {
          Cash: "bg-success/10 text-success",
          Card: "bg-primary/10 text-primary",
          UPI: "bg-secondary/10 text-secondary",
        };
        return (
          <Badge className={colors[item.paymentMode as keyof typeof colors]}>
            {item.paymentMode}
          </Badge>
        );
      },
    },
  ];

  return <DataTable data={mockSales} columns={columns} />;
};
