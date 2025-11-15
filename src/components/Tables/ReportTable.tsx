import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportData {
  [key: string]: string | number;
}

interface ReportTableProps {
  columns: { key: string; label: string }[];
  data: ReportData[];
}

export const ReportTable = ({ columns, data }: ReportTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                {typeof row[column.key] === 'number' 
                  ? row[column.key].toLocaleString() 
                  : row[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
