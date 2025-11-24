// components/Tables/SalesTable.tsx - COMPLETE VERSION
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Fuel, User, Building } from "lucide-react";

interface Shift {
  _id: string;
  shiftId: string;
  nozzleman: {
    name: string;
    employeeId: string;
  };
  pump: {
    name: string;
    location: string;
  };
  nozzle: {
    number: string;
    fuelType: string;
  };
  fuelDispensed: number;
  cashCollected: number;
  phonePeSales: number;
  posSales: number;
  otpSales: number;
  creditSales: number;
  status: string;
  startTime: string;
  endTime: string;
}

interface SalesTableProps {
  shifts: Shift[];
}

export const SalesTable = ({ shifts }: SalesTableProps) => {
  const getPaymentBadge = (shift: Shift) => {
    const totalSales = shift.cashCollected + shift.phonePeSales + shift.posSales + shift.otpSales + shift.creditSales;
    const hasMultiplePayments = [
      shift.cashCollected > 0,
      shift.phonePeSales > 0,
      shift.posSales > 0,
      shift.creditSales > 0
    ].filter(Boolean).length > 1;

    if (hasMultiplePayments) {
      return <Badge variant="secondary">Mixed</Badge>;
    }

    if (shift.cashCollected > 0) return <Badge variant="default">Cash</Badge>;
    if (shift.phonePeSales > 0) return <Badge variant="secondary">UPI</Badge>;
    if (shift.posSales > 0) return <Badge variant="outline">Card</Badge>;
    if (shift.creditSales > 0) return <Badge variant="outline">Credit</Badge>;
    
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'Pending Approval':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'petrol':
        return <Fuel className="h-4 w-4 text-green-600" />;
      case 'diesel':
        return <Fuel className="h-4 w-4 text-blue-600" />;
      case 'cng':
        return <Fuel className="h-4 w-4 text-purple-600" />;
      default:
        return <Fuel className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateTotalSales = (shift: Shift) => {
    return shift.cashCollected + shift.phonePeSales + shift.posSales + shift.otpSales + shift.creditSales;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shift ID</TableHead>
            <TableHead>Nozzleman</TableHead>
            <TableHead>Date/Time</TableHead>
            <TableHead>Pump</TableHead>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Nozzle</TableHead>
            <TableHead>Fuel Sold</TableHead>
            <TableHead>Total Sales</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center justify-center">
                  <Fuel className="h-12 w-12 mb-4 opacity-50" />
                  <p>No shift data found</p>
                  <p className="text-sm">Shift data will appear here when shifts are completed</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            shifts.map((shift) => {
              const totalSales = calculateTotalSales(shift);
              
              return (
                <TableRow key={shift._id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {shift.shiftId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {shift.nozzleman.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{shift.nozzleman.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {formatDate(shift.startTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(shift.startTime)} - {shift.endTime ? formatTime(shift.endTime) : 'Ongoing'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shift.pump.name}</div>
                      <div className="text-xs text-muted-foreground">{shift.pump.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFuelIcon(shift.nozzle.fuelType)}
                      <span className="capitalize">{shift.nozzle.fuelType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {shift.nozzle.number}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{shift.fuelDispensed} L</div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    <div className="text-green-600">₹{totalSales.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      Cash: ₹{shift.cashCollected.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>{getPaymentBadge(shift)}</TableCell>
                  <TableCell>{getStatusBadge(shift.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};