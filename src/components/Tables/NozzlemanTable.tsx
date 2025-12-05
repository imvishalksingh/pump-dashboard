// components/Tables/NozzlemanTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

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
  onDelete: (nozzlemanId: string) => void;
  refresh?: number;
}

export const NozzlemanTable = ({ onEdit, onDelete, refresh = 0 }: NozzlemanTableProps) => {
  const [nozzlemen, setNozzlemen] = useState<Nozzleman[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNozzlemen();
  }, [refresh]);

  const fetchNozzlemen = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/nozzlemen");
      
      // Handle different response formats
      let nozzlemenData = [];
      const responseData = response.data;
      
      console.log("📊 Nozzlemen API response:", responseData);
      
      if (Array.isArray(responseData)) {
        nozzlemenData = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        nozzlemenData = responseData.data;
      } else if (responseData && Array.isArray(responseData.nozzlemen)) {
        nozzlemenData = responseData.nozzlemen;
      } else if (responseData && responseData.success && Array.isArray(responseData.data)) {
        nozzlemenData = responseData.data;
      } else {
        console.error("Unexpected API response format:", responseData);
        nozzlemenData = [];
      }
      
      console.log("✅ Parsed nozzlemen data:", nozzlemenData.length);
      setNozzlemen(nozzlemenData);
    } catch (error: any) {
      console.error("❌ Failed to fetch nozzlemen:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch nozzlemen",
        variant: "destructive",
      });
      setNozzlemen([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const deleteNozzleman = async (id: string) => {
    if (!confirm("Are you sure you want to delete this nozzleman?")) {
      return;
    }

    try {
      // Use the onDelete prop from parent instead of direct API call
      await onDelete(id);
      // The parent will handle the refresh via refresh prop
    } catch (error: any) {
      // Error is already handled by parent
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

  // Handle nozzle display safely
  const renderNozzles = (assignedNozzles: any[]) => {
    if (!Array.isArray(assignedNozzles) || assignedNozzles.length === 0) {
      return <span className="text-muted-foreground">-</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {assignedNozzles.slice(0, 3).map((nozzle, index) => {
          let nozzleText = "-";
          
          if (typeof nozzle === 'object' && nozzle !== null) {
            nozzleText = nozzle.number || nozzle._id || `Nozzle ${index + 1}`;
          } else if (typeof nozzle === 'string') {
            nozzleText = nozzle;
          }
          
          return (
            <Badge key={index} variant="secondary" className="text-xs">
              {nozzleText}
            </Badge>
          );
        })}
        {assignedNozzles.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{assignedNozzles.length - 3} more
          </Badge>
        )}
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Employee ID</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Mobile</TableHead>
              <TableHead className="whitespace-nowrap">Shift</TableHead>
              <TableHead className="whitespace-nowrap">Assigned Pump</TableHead>
              <TableHead className="whitespace-nowrap">Nozzles</TableHead>
              <TableHead className="whitespace-nowrap">Rating</TableHead>
              <TableHead className="whitespace-nowrap">Total Shifts</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!Array.isArray(nozzlemen) || nozzlemen.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No nozzlemen found.
                </TableCell>
              </TableRow>
            ) : (
              nozzlemen.map((nozzleman) => (
                <TableRow key={nozzleman._id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {nozzleman.employeeId || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {nozzleman.name || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {nozzleman.mobile || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline">
                      {nozzleman.shift || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {nozzleman.assignedPump?.name || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {renderNozzles(nozzleman.assignedNozzles || [])}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {renderRating(nozzleman.rating || 0)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {nozzleman.totalShifts || 0}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={getStatusColor(nozzleman.status || "Inactive") as any}>
                      {nozzleman.status || "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onEdit(nozzleman)}
                        title="Edit nozzleman"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteNozzleman(nozzleman._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete nozzleman"
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
    </div>
  );
};