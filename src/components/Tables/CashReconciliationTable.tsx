// components/Tables/CashReconciliationTable.tsx - UPDATED
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface CashHandover {
  _id: string;
  shift: {
    _id: string;
    shiftId: string;
  };
  nozzleman: {
    _id: string;
    name: string;
    employeeId: string;
  };
  amount: number;
  status: string;
  verifiedBy?: {
    name: string;
  };
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

interface CashReconciliationTableProps {
  handovers: CashHandover[];
  onVerify: (id: string) => void;
  onReject: (id: string, notes: string) => void;
}

export const CashReconciliationTable = ({ handovers, onVerify, onReject }: CashReconciliationTableProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Verified":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Verified":
        return <CheckCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleReject = (handoverId: string) => {
    const notes = prompt("Enter rejection reason:");
    if (notes) {
      onReject(handoverId, notes);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shift ID</TableHead>
            <TableHead>Nozzleman</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {handovers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No cash handovers found
              </TableCell>
            </TableRow>
          ) : (
            handovers.map((handover) => (
              <TableRow key={handover._id}>
                <TableCell className="font-medium">{handover.shift.shiftId}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{handover.nozzleman.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {handover.nozzleman.employeeId}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">₹{handover.amount.toLocaleString()}</TableCell>
                <TableCell>
                  {new Date(handover.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(handover.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(handover.status)}
                    {handover.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {handover.verifiedBy?.name || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {handover.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onVerify(handover._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(handover._id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
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