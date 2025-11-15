// components/Tables/NozzlemanAssignmentTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
    number: string;
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
}

export const NozzlemanAssignmentTable = ({ refresh = 0 }: NozzlemanAssignmentTableProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, [refresh]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/assignments");
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
    if (!confirm("Remove this assignment?")) {
      return;
    }

    try {
      await api.delete(`/assignments/${id}`);
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove assignment",
        variant: "destructive",
      });
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nozzleman</TableHead>
            <TableHead>Nozzle</TableHead>
            <TableHead>Pump</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No assignments found.
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment._id}>
                <TableCell className="font-medium">{assignment.nozzleman.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{assignment.nozzle.number}</Badge>
                </TableCell>
                <TableCell>{assignment.pump.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{assignment.shift}</Badge>
                </TableCell>
                <TableCell>{new Date(assignment.assignedDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {assignment.startTime && assignment.endTime
                    ? `${assignment.startTime} - ${assignment.endTime}`
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(assignment.status) as any}>
                    {assignment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {assignment.status === "Active" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAssignment(assignment._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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