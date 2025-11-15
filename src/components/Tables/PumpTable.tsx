// components/Tables/PumpTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Pump {
  _id: string;
  name: string;
  location: string;
  fuelType: string;
  status: string;
  currentReading: number;
  totalSales: number;
  lastCalibration: string;
  nozzles: any[];
  createdAt: string;
}

interface PumpTableProps {
  onEdit: (pump: Pump) => void;
  refresh: number;
  onRefresh: () => void;
}

export const PumpTable = ({ onEdit, refresh, onRefresh }: PumpTableProps) => {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPumps();
  }, [refresh]);

  const fetchPumps = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/pumps");
      setPumps(response.data);
    } catch (error: any) {
      console.error("Failed to fetch pumps:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch pumps",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePump = async (pumpId: string) => {
    if (!confirm("Are you sure you want to delete this pump?")) {
      return;
    }

    try {
      await axios.delete(`/api/pumps/${pumpId}`);
      toast({
        title: "Success",
        description: "Pump deleted successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete pump",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Maintenance":
        return "secondary";
      case "Inactive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getFuelColor = (fuelType: string) => {
    const colors = {
      Petrol: "bg-red-100 text-red-800",
      Diesel: "bg-blue-100 text-blue-800",
      CNG: "bg-purple-100 text-purple-800",
    };
    return colors[fuelType as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading pumps...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Reading</TableHead>
            <TableHead>Total Sales</TableHead>
            <TableHead>Assigned Nozzles</TableHead>
            <TableHead>Last Calibration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pumps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No pumps found. Create your first pump to get started.
              </TableCell>
            </TableRow>
          ) : (
            pumps.map((pump) => (
              <TableRow key={pump._id}>
                <TableCell className="font-medium">{pump.name}</TableCell>
                <TableCell>{pump.location}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getFuelColor(pump.fuelType)}>
                    {pump.fuelType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(pump.status)}>{pump.status}</Badge>
                </TableCell>
                <TableCell>{pump.currentReading.toLocaleString()} L</TableCell>
                <TableCell>₹{pump.totalSales.toLocaleString()}</TableCell>
                <TableCell>{pump.nozzles?.length || 0}</TableCell>
                <TableCell>{new Date(pump.lastCalibration).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(pump)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deletePump(pump._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};