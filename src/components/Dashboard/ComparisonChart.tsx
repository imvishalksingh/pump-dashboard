import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const comparisonData = [
  { day: "Mon", sales: 18500, stock: 18200, variance: 300 },
  { day: "Tue", sales: 21000, stock: 20900, variance: 100 },
  { day: "Wed", sales: 19500, stock: 19600, variance: -100 },
  { day: "Thu", sales: 23000, stock: 22800, variance: 200 },
  { day: "Fri", sales: 24500, stock: 24300, variance: 200 },
  { day: "Sat", sales: 28000, stock: 27850, variance: 150 },
  { day: "Sun", sales: 26500, stock: 26400, variance: 100 },
];

export const ComparisonChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sales vs Stock Reconciliation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comparing sales records with stock depletion (Last 7 Days)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          <Bar dataKey="sales" fill="hsl(var(--chart-primary))" name="Sales (L)" />
          <Bar dataKey="stock" fill="hsl(var(--chart-secondary))" name="Stock Depletion (L)" />
          <Bar dataKey="variance" fill="hsl(var(--warning))" name="Variance (L)" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 rounded-lg bg-primary/10">
          <p className="text-sm text-muted-foreground">Avg Variance</p>
          <p className="text-lg font-semibold text-foreground">+136 L</p>
        </div>
        <div className="p-3 rounded-lg bg-success/10">
          <p className="text-sm text-muted-foreground">Days Matched</p>
          <p className="text-lg font-semibold text-foreground">6/7</p>
        </div>
        <div className="p-3 rounded-lg bg-warning/10">
          <p className="text-sm text-muted-foreground">Accuracy</p>
          <p className="text-lg font-semibold text-foreground">99.2%</p>
        </div>
      </div>
    </Card>
  );
};
