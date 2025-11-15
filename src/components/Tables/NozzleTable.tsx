// components/Tables/NozzleTable.tsx - UPDATED VERSION
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Nozzle {
  _id: string;
  number: string;
  pump: {
    _id: string;
    name: string;
  };
  fuelType: string;
  status: string;
  currentReading: number;
  totalDispensed: number;
  lastCalibration: string;
  rate: number;
}

interface NozzleTableProps {
  onEdit?: (nozzle: Nozzle) => void;
  refresh?: number;
  onRefresh?: () => void;
}

export const NozzleTable = ({ onEdit, refresh = 0, onRefresh }: NozzleTableProps) => {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNozzles();
  }, [refresh]);

  const fetchNozzles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/nozzles");
      setNozzles(response.data);
    } catch (error: any) {
      console.error("Failed to fetch nozzles:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch nozzles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNozzle = async (nozzleId: string) => {
    if (!confirm("Are you sure you want to delete this nozzle?")) {
      return;
    }

    try {
      await axios.delete(`/api/nozzles/${nozzleId}`);
      toast({
        title: "Success",
        description: "Nozzle deleted successfully",
      });
      fetchNozzles();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete nozzle",
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
        <p className="mt-4 text-muted-foreground">Loading nozzles...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nozzle Number</TableHead>
            <TableHead>Pump</TableHead>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Reading</TableHead>
            <TableHead>Total Dispensed</TableHead>
            <TableHead>Rate (₹/L)</TableHead>
            <TableHead>Last Calibration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nozzles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No nozzles found. Create your first nozzle to get started.
              </TableCell>
            </TableRow>
          ) : (
            nozzles.map((nozzle) => (
              <TableRow key={nozzle._id}>
                <TableCell className="font-medium">{nozzle.number}</TableCell>
                <TableCell>{nozzle.pump?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getFuelColor(nozzle.fuelType)}>
                    {nozzle.fuelType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(nozzle.status)}>
                    {nozzle.status}
                  </Badge>
                </TableCell>
                <TableCell>{(nozzle.currentReading || 0).toLocaleString()} L</TableCell>
                <TableCell>{(nozzle.totalDispensed || 0).toLocaleString()} L</TableCell>
                <TableCell>₹{(nozzle.rate || 0).toLocaleString()}</TableCell>
                <TableCell>
                  {nozzle.lastCalibration 
                    ? new Date(nozzle.lastCalibration).toLocaleDateString()
                    : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit?.(nozzle)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteNozzle(nozzle._id)}
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