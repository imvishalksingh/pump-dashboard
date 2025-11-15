// components/Tables/NozzlemanTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Nozzleman {
  _id: string;
  employeeId: string;
  name: string;
  mobile: string;
  shift: string;
  status: string;
  assignedPump?: {
    _id: string;
    name: string;
  };
  assignedNozzles: any[];
  rating: number;
  totalShifts: number;
  totalFuelDispensed: number;
  averageCashHandled: number;
  joinDate: string;
}

interface NozzlemanTableProps {
  onEdit: (nozzleman: Nozzleman) => void;
  refresh?: number;
}

export const NozzlemanTable = ({ onEdit, refresh = 0 }: NozzlemanTableProps) => {
  const [nozzlemen, setNozzlemen] = useState<Nozzleman[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNozzlemen();
  }, [refresh]);

  const fetchNozzlemen = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/nozzlemen");
      setNozzlemen(response.data);
    } catch (error: any) {
      console.error("Failed to fetch nozzlemen:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch nozzlemen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNozzleman = async (id: string) => {
    if (!confirm("Are you sure you want to delete this nozzleman?")) {
      return;
    }

    try {
      await axios.delete(`/api/nozzlemen/${id}`);
      toast({
        title: "Success",
        description: "Nozzleman deleted successfully",
      });
      fetchNozzlemen();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete nozzleman",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Inactive": return "secondary";
      case "On Leave": return "outline";
      default: return "secondary";
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="text-sm ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading nozzlemen...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Assigned Pump</TableHead>
            <TableHead>Nozzles</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Total Shifts</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nozzlemen.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No nozzlemen found.
              </TableCell>
            </TableRow>
          ) : (
            nozzlemen.map((nozzleman) => (
              <TableRow key={nozzleman._id}>
                <TableCell className="font-medium">{nozzleman.employeeId}</TableCell>
                <TableCell>{nozzleman.name}</TableCell>
                <TableCell>{nozzleman.mobile}</TableCell>
                <TableCell>
                  <Badge variant="outline">{nozzleman.shift}</Badge>
                </TableCell>
                <TableCell>{nozzleman.assignedPump?.name || "-"}</TableCell>
                <TableCell>
                  {nozzleman.assignedNozzles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {nozzleman.assignedNozzles.map((nozzle, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {typeof nozzle === 'object' ? nozzle.number : nozzle}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{renderRating(nozzleman.rating)}</TableCell>
                <TableCell>{nozzleman.totalShifts}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(nozzleman.status) as any}>
                    {nozzleman.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(nozzleman)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteNozzleman(nozzleman._id)}
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