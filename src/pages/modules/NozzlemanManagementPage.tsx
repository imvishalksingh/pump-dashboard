import { useState, useEffect } from "react";
import { Plus, UserCog, Users, Star, Clock, Fuel, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/Shared/PageHeader";
import { NozzlemanTable } from "@/components/Tables/NozzlemanTable";
import { NozzlemanAssignmentTable } from "@/components/Tables/NozzlemanAssignmentTable";
import { NozzlemanFormModal } from "@/components/Modals/NozzlemanFormModal";
import { NozzleAssignModal } from "@/components/Modals/NozzleAssignModal";
import { useToast } from "@/hooks/use-toast";
import { useNozzleman } from "@/hooks/useNozzleman";
import { useAuth } from "../../context/AuthContext";
import api from "@/utils/api";

interface Nozzleman {
  _id: string;
  employeeId: string;
  name: string;
  mobile: string;
  shift: string;
  status: string;
  assignedPump?: any;
  assignedNozzles: any[];
  rating: number;
  totalShifts: number;
  totalFuelDispensed: number;
  averageCashHandled: number;
  joinDate: string;
}

export default function NozzlemanManagementPage() {
  const { user, registerNozzleman: registerNozzlemanAuth } = useAuth();
  const { 
    nozzlemen, 
    loading, 
    error,
    fetchNozzlemen, 
    updateNozzleman,
    deleteNozzleman,
    canManageNozzlemen 
  } = useNozzleman();
  
  const [showNozzlemanModal, setShowNozzlemanModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingNozzleman, setEditingNozzleman] = useState<Nozzleman | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Check if user has permission to access this page
  useEffect(() => {
    if (user && !canManageNozzlemen) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
    }
  }, [user, canManageNozzlemen, toast]);

  // Refresh nozzlemen data
  useEffect(() => {
    if (canManageNozzlemen) {
      fetchNozzlemen();
    }
  }, [refreshTrigger, canManageNozzlemen]);
const handleAddNozzleman = async (data: any) => {
  try {
    console.log("📝 Adding new nozzleman:", data);
    
    // Use the auth context's registerNozzleman function directly
    const result = await registerNozzlemanAuth(data);
    
    if (result.success) {
      // Refresh the nozzlemen list
      await fetchNozzlemen();
      setShowNozzlemanModal(false);
      toast({
        title: "Success",
        description: "Nozzleman added successfully",
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error: any) {
    console.error("❌ Failed to add nozzleman:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to add nozzleman",
      variant: "destructive",
    });
  }
};
  const handleEditNozzleman = (nozzleman: Nozzleman) => {
    setEditingNozzleman(nozzleman);
    setShowNozzlemanModal(true);
  };

  const handleUpdateNozzleman = async (data: any) => {
    if (!editingNozzleman) return;

    try {
      console.log("📝 Updating nozzleman:", editingNozzleman._id, data);
      
      await updateNozzleman(editingNozzleman._id, data);
      setEditingNozzleman(null);
      setShowNozzlemanModal(false);
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "Success",
        description: "Nozzleman updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Failed to update nozzleman:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update nozzleman",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNozzleman = async (nozzlemanId: string) => {
    if (!confirm("Are you sure you want to delete this nozzleman? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteNozzleman(nozzlemanId);
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Success",
        description: "Nozzleman deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Failed to delete nozzleman:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete nozzleman",
        variant: "destructive",
      });
    }
  };

  const handleAssignNozzle = async (data: any) => {
    try {
      console.log("🔧 Assigning nozzle:", data);
      
      await api.post("/api/assignments", data);
      setShowAssignModal(false);
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "Success",
        description: "Nozzle assigned successfully",
      });
    } catch (error: any) {
      console.error("❌ Failed to assign nozzle:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign nozzle",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const activeNozzlemen = nozzlemen.filter(n => n.status === "Active").length;
  const inactiveNozzlemen = nozzlemen.filter(n => n.status === "Inactive").length;
  const onLeaveNozzlemen = nozzlemen.filter(n => n.status === "On Leave").length;
  
  const avgRating = nozzlemen.length > 0 
    ? (nozzlemen.reduce((sum, n) => sum + n.rating, 0) / nozzlemen.length).toFixed(1)
    : "0.0";
  
  const totalShifts = nozzlemen.reduce((sum, n) => sum + n.totalShifts, 0);
  const totalFuelDispensed = nozzlemen.reduce((sum, n) => sum + n.totalFuelDispensed, 0);
  const totalCashHandled = nozzlemen.reduce((sum, n) => sum + n.averageCashHandled * n.totalShifts, 0);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading nozzlemen data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <p className="text-lg font-semibold">Error loading nozzlemen</p>
          <p className="text-sm mt-2">{error}</p>
          <Button onClick={() => fetchNozzlemen()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show access denied
  if (!canManageNozzlemen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UserCog className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to access nozzleman management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Nozzleman Management"
        description="Manage nozzlemen profiles, assignments, and performance tracking"
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nozzlemen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nozzlemen.length}</div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{activeNozzlemen} active</span>
                <span>{inactiveNozzlemen} inactive</span>
                <span>{onLeaveNozzlemen} on leave</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating} / 5.0</div>
              <p className="text-xs text-muted-foreground">
                Overall performance score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalShifts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Completed shifts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fuel Dispensed</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalFuelDispensed.toLocaleString()} L
              </div>
              <p className="text-xs text-muted-foreground">Total fuel sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Handled</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{totalCashHandled.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total revenue handled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cash/Shift</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ₹{totalShifts > 0 ? Math.round(totalCashHandled / totalShifts).toLocaleString() : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Average per shift</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Fuel/Shift</CardTitle>
              <Fuel className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalShifts > 0 ? Math.round(totalFuelDispensed / totalShifts).toLocaleString() : '0'} L
              </div>
              <p className="text-xs text-muted-foreground">Average per shift</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="nozzlemen" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="nozzlemen">Nozzlemen List</TabsTrigger>
              <TabsTrigger value="assignments">Nozzle Assignments</TabsTrigger>
              <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAssignModal(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Nozzle
              </Button>
              <Button 
                onClick={() => { 
                  setEditingNozzleman(null); 
                  setShowNozzlemanModal(true); 
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Nozzleman
              </Button>
            </div>
          </div>

          {/* Nozzlemen Tab */}
          <TabsContent value="nozzlemen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Nozzlemen List ({nozzlemen.length} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NozzlemanTable
                  onEdit={handleEditNozzleman}
                  onDelete={handleDeleteNozzleman}
                  refresh={refreshTrigger}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Nozzle Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NozzlemanAssignmentTable 
                  refresh={refreshTrigger} 
                  onUpdate={() => setRefreshTrigger(prev => prev + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Top Performers */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Top Performers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {nozzlemen
                          .filter(n => n.status === "Active")
                          .sort((a, b) => b.rating - a.rating)
                          .slice(0, 3)
                          .map((nozzleman, index) => (
                            <div key={nozzleman._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-800 text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{nozzleman.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm">{nozzleman.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>

                    {/* Shift Leaders */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Most Shifts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {nozzlemen
                          .filter(n => n.status === "Active")
                          .sort((a, b) => b.totalShifts - a.totalShifts)
                          .slice(0, 3)
                          .map((nozzleman, index) => (
                            <div key={nozzleman._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{nozzleman.name}</span>
                              </div>
                              <span className="text-sm font-semibold">{nozzleman.totalShifts}</span>
                            </div>
                          ))}
                      </CardContent>
                    </Card>

                    {/* Fuel Champions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Fuel Dispensed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {nozzlemen
                          .filter(n => n.status === "Active")
                          .sort((a, b) => b.totalFuelDispensed - a.totalFuelDispensed)
                          .slice(0, 3)
                          .map((nozzleman, index) => (
                            <div key={nozzleman._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-800 text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{nozzleman.name}</span>
                              </div>
                              <span className="text-sm font-semibold">{nozzleman.totalFuelDispensed.toLocaleString()}L</span>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NozzlemanFormModal
        open={showNozzlemanModal}
        onClose={() => {
          setShowNozzlemanModal(false);
          setEditingNozzleman(null);
        }}
        onSubmit={editingNozzleman ? handleUpdateNozzleman : handleAddNozzleman}
        initialData={editingNozzleman || undefined}
        mode={editingNozzleman ? "edit" : "add"}
      />

      <NozzleAssignModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAssignNozzle}
        nozzlemen={nozzlemen
          .filter(n => n.status === "Active")
          .map(n => ({
            _id: n._id,
            name: n.name,
            employeeId: n.employeeId
          }))
        }
      />
    </div>
  );
}