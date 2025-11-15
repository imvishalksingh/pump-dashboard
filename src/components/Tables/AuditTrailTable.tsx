import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditTrail } from "@/data/mockData";

interface AuditTrailTableProps {
  trails: AuditTrail[];
}

export const AuditTrailTable = ({ trails }: AuditTrailTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Remarks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trails.map((trail) => (
          <TableRow key={trail.id}>
            <TableCell>{new Date(trail.timestamp).toLocaleString()}</TableCell>
            <TableCell className="font-medium">{trail.user}</TableCell>
            <TableCell>{trail.action}</TableCell>
            <TableCell className="text-muted-foreground">{trail.entity}</TableCell>
            <TableCell className="text-muted-foreground">{trail.remarks}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
