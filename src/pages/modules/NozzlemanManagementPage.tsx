// pages/NozzlemanManagementPage.tsx
import { useState, useEffect } from "react";
import { Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/Shared/PageHeader";
import { NozzlemanTable } from "@/components/Tables/NozzlemanTable";
import { NozzlemanAssignmentTable } from "@/components/Tables/NozzlemanAssignmentTable";
import { NozzlemanFormModal } from "@/components/Modals/NozzlemanFormModal";
import { NozzleAssignModal } from "@/components/Modals/NozzleAssignModal";
import { useToast } from "@/hooks/use-toast";
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
  const [nozzlemen, setNozzlemen] = useState<Nozzleman[]>([]);
  const [showNozzlemanModal, setShowNozzlemanModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingNozzleman, setEditingNozzleman] = useState<Nozzleman | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchNozzlemen();
  }, []);

  const fetchNozzlemen = async () => {
    try {
      const response = await api.get("/api/nozzlemen");
      setNozzlemen(response.data);
    } catch (error: any) {
      console.error("Failed to fetch nozzlemen:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch nozzlemen",
        variant: "destructive",
      });
    }
  };

  const handleAddNozzleman = async (data: any) => {
    try {
      const response = await api.post("/api/nozzlemen", data);
      setNozzlemen(prev => [...prev, response.data]);
      setShowNozzlemanModal(false);
      toast({
        title: "Success",
        description: "Nozzleman added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add nozzleman",
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
      const response = await api.put(`/api/nozzlemen/${editingNozzleman._id}`, data);
      setNozzlemen(prev => prev.map(n => 
        n._id === editingNozzleman._id ? response.data : n
      ));
      setEditingNozzleman(null);
      setShowNozzlemanModal(false);
      toast({
        title: "Success",
        description: "Nozzleman updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update nozzleman",
        variant: "destructive",
      });
    }
  };

  const handleAssignNozzle = async (data: any) => {
    try {
      await api.post("/api/assignments", data);
      setShowAssignModal(false);
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Success",
        description: "Nozzle assigned successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign nozzle",
        variant: "destructive",
      });
    }
  };

  const activeNozzlemen = nozzlemen.filter(n => n.status === "Active").length;
  const avgRating = nozzlemen.length > 0 
    ? (nozzlemen.reduce((sum, n) => sum + n.rating, 0) / nozzlemen.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Nozzleman Management"
        description="Manage nozzlemen profiles, assignments, and performance"
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nozzlemen</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nozzlemen.length}</div>
              <p className="text-xs text-muted-foreground">{activeNozzlemen} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating} / 5.0</div>
              <p className="text-xs text-muted-foreground">Performance score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nozzlemen.reduce((sum, n) => sum + n.totalShifts, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Completed shifts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fuel Dispensed</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nozzlemen.reduce((sum, n) => sum + n.totalFuelDispensed, 0).toLocaleString()} L
              </div>
              <p className="text-xs text-muted-foreground">Total fuel</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="nozzlemen" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="nozzlemen">Nozzlemen</TabsTrigger>
              {/* <TabsTrigger value="assignments">Assignments</TabsTrigger> */}
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={() => setShowAssignModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Nozzle
              </Button>
              <Button onClick={() => { setEditingNozzleman(null); setShowNozzlemanModal(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Nozzleman
              </Button>
            </div>
          </div>

          <TabsContent value="nozzlemen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nozzlemen List</CardTitle>
              </CardHeader>
              <CardContent>
                <NozzlemanTable
                  onEdit={handleEditNozzleman}
                  refresh={refreshTrigger}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nozzle Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <NozzlemanAssignmentTable refresh={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showNozzlemanModal && (
        <NozzlemanFormModal
  open={showNozzlemanModal}
  onClose={() => {
    setShowNozzlemanModal(false);
    setEditingNozzleman(null);
  }}
  onSubmit={editingNozzleman ? handleUpdateNozzleman : handleAddNozzleman}
  initialData={editingNozzleman || undefined}
/>
      )}

      {showAssignModal && (
        // In your NozzlemanManagementPage.tsx - Update the modal usage
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
      )}
    </div>
  );
}