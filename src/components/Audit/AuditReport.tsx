// components/Audit/AuditReport.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, FileText, CheckCircle, XCircle, Clock, User, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface AuditLog {
  _id: string;
  action: "approved" | "rejected";
  entityType: string;
  entityName: string;
  notes: string;
  details: any;
  performedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface AuditSummary {
  shiftsApproved: number;
  shiftsRejected: number;
  cashEntriesApproved: number;
  stockAdjustmentsApproved: number;
  totalAudits: number;
}

interface AuditReportData {
  reportDate: string;
  summary: AuditSummary;
  auditLogs: AuditLog[];
  existingReport?: {
    _id: string;
    overallFindings: string;
    recommendations: string;
    isDataVerified: boolean;
    signedAt: string;
  };
}

export const AuditReport = () => {
  const [reportData, setReportData] = useState<AuditReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [signOffLoading, setSignOffLoading] = useState(false);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [findings, setFindings] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isDataVerified, setIsDataVerified] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditReport();
  }, [selectedDate]);

  const fetchAuditReport = async () => {
    try {
      setLoading(true);
      const response = await api.get("/audit/report", {
        params: {
          date: selectedDate.toISOString().split('T')[0]
        }
      });
      setReportData(response.data);
    } catch (error: any) {
      console.error("Failed to fetch audit report:", error);
      toast({
        title: "Error",
        description: "Failed to load audit report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOff = async () => {
    try {
      setSignOffLoading(true);
      await api.post("/audit/report/sign-off", {
        reportDate: selectedDate.toISOString().split('T')[0],
        overallFindings: findings,
        recommendations: recommendations,
        isDataVerified: isDataVerified
      });

      toast({
        title: "Success",
        description: "Audit report signed off successfully",
      });

      setShowSignOffModal(false);
      fetchAuditReport();
    } catch (error: any) {
      console.error("Failed to sign off audit report:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to sign off audit report",
        variant: "destructive",
      });
    } finally {
      setSignOffLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  const getActionIcon = (action: string) => {
    return action === "approved" ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getEntityColor = (entityType: string) => {
    const colors = {
      Shift: "bg-blue-100 text-blue-800",
      CashEntry: "bg-green-100 text-green-800",
      StockAdjustment: "bg-orange-100 text-orange-800",
      SalesTransaction: "bg-purple-100 text-purple-800"
    };
    return colors[entityType as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Daily Audit Report
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive audit trail and digital sign-off
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {reportData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{reportData.summary.shiftsApproved}</div>
              <div className="text-sm text-blue-600">Shifts Approved</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{reportData.summary.shiftsRejected}</div>
              <div className="text-sm text-red-600">Shifts Rejected</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{reportData.summary.cashEntriesApproved}</div>
              <div className="text-sm text-green-600">Cash Entries</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{reportData.summary.stockAdjustmentsApproved}</div>
              <div className="text-sm text-orange-600">Stock Adjustments</div>
            </div>
          </div>
        )}

        {/* Sign-off Status */}
        {reportData?.existingReport ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Audit Report Signed Off</p>
                  <p className="text-sm text-green-600">
                    Signed on {new Date(reportData.existingReport.signedAt).toLocaleDateString()} at{" "}
                    {new Date(reportData.existingReport.signedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Verified
              </Badge>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Pending Sign-off</p>
                  <p className="text-sm text-yellow-600">
                    Complete audit verification and sign off the report
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowSignOffModal(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Sign Off Report
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Audit Logs */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Audit Trail</h4>
        <div className="space-y-4">
          {reportData?.auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>No audit activities for selected date</p>
            </div>
          ) : (
            reportData?.auditLogs.map((log) => (
              <div key={log._id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getEntityColor(log.entityType)}>
                      {log.entityType}
                    </Badge>
                    <span className={`font-medium ${
                      log.action === "approved" ? "text-green-600" : "text-red-600"
                    }`}>
                      {log.action.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">{log.entityName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                  {log.details && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {Object.entries(log.details).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" />
                    {log.performedBy.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Sign Off Modal */}
      {showSignOffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <h4 className="text-lg font-semibold mb-4">Sign Off Audit Report</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Overall Findings</label>
                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Summarize your audit findings..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recommendations</label>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  placeholder="Any recommendations for improvement..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dataVerified"
                  checked={isDataVerified}
                  onChange={(e) => setIsDataVerified(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="dataVerified" className="text-sm font-medium">
                  I verify that all data has been audited and is accurate
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSignOffModal(false)}
                  disabled={signOffLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSignOff}
                  disabled={!findings.trim() || !isDataVerified || signOffLoading}
                >
                  {signOffLoading ? "Signing Off..." : "Sign Off Report"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};