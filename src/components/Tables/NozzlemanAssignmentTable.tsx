// components/Tables/NozzlemanAssignmentTable.tsx - UPDATED
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface Assignment {
  _id: string;
  nozzleman: {
    _id: string;
    name: string;
  };
  nozzle: {
    _id: string;
    number: string | null;
  };
  pump: {
    _id: string;
    name: string;
  };
  shift: string;
  assignedDate: string;
  startTime?: string;
  endTime?: string;
  status: string;
}

interface NozzlemanAssignmentTableProps {
  refresh?: number;
  onUpdate?: () => void; // Make onUpdate optional
}

export const NozzlemanAssignmentTable = ({ 
  refresh = 0, 
  onUpdate 
}: NozzlemanAssignmentTableProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, [refresh]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/assignments");
      setAssignments(response.data);
    } catch (error: any) {
      console.error("Failed to fetch assignments:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    try {
      await api.delete(`/api/assignments/${id}`);
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });
      
      // Refresh the assignments list
      await fetchAssignments();
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error("Failed to remove assignment:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    await fetchAssignments();
    if (onUpdate) {
      onUpdate();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Completed": return "secondary";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  const getShiftTiming = (shift: string) => {
    switch (shift) {
      case "Morning": return "6:00 AM - 2:00 PM";
      case "Evening": return "2:00 PM - 10:00 PM";
      case "Night": return "10:00 PM - 6:00 AM";
      default: return "-";
    }
  };

  const getNozzleNumber = (nozzle: { number: string | null }) => {
    return nozzle.number || "N/A";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Nozzle Assignments ({assignments.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nozzleman</TableHead>
            <TableHead>Nozzle</TableHead>
            <TableHead>Pump</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Timing</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center justify-center">
                  <X className="h-12 w-12 mb-4 opacity-50" />
                  <p>No assignments found</p>
                  <p className="text-sm">Assign nozzles to nozzlemen to see them here</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment._id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{assignment.nozzleman.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {assignment.nozzleman._id.slice(-6)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {getNozzleNumber(assignment.nozzle)}
                  </Badge>
                </TableCell>
                <TableCell>{assignment.pump.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Badge variant="secondary" className="mb-1">
                      {assignment.shift}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getShiftTiming(assignment.shift)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(assignment.assignedDate)}</TableCell>
                <TableCell>
                  {assignment.startTime && assignment.endTime
                    ? `${assignment.startTime} - ${assignment.endTime}`
                    : getShiftTiming(assignment.shift)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(assignment.status) as any}>
                    {assignment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {assignment.status === "Active" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAssignment(assignment._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Remove assignment"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};