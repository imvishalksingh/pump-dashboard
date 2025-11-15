// pages/PumpNozzleManagementPage.tsx - UPDATED VERSION
import { useState } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PumpTable } from "@/components/Tables/PumpTable";
import { NozzleTable } from "@/components/Tables/NozzleTable";
import { AddPumpModal } from "@/components/Modals/AddPumpModal";
import { EditPumpModal } from "@/components/Modals/EditPumpModal";
import { AddNozzleModal } from "@/components/Modals/AddNozzleModel";
import { EditNozzleModal } from "@/components/Modals/EditNozzleModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Pump {
  _id: string;
  name: string;
  location: string;
  fuelType: string;
  status: string;
  currentReading: number;
  totalSales: number;
  lastCalibration: string;
  nozzles: any[];
}

interface Nozzle {
  _id: string;
  number: string;
  pump: {
    _id: string;
    name: string;
  };
  fuelType: string;
  status: string;
  currentReading: number;
  rate: number;
}

export const PumpNozzleManagementPage = () => {
  const [addPumpModalOpen, setAddPumpModalOpen] = useState(false);
  const [addNozzleModalOpen, setAddNozzleModalOpen] = useState(false);
  const [editPumpModalOpen, setEditPumpModalOpen] = useState(false);
  const [editNozzleModalOpen, setEditNozzleModalOpen] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [selectedNozzle, setSelectedNozzle] = useState<Nozzle | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("pumps");

  const handleEditPump = (pump: Pump) => {
    setSelectedPump(pump);
    setEditPumpModalOpen(true);
  };

  const handleEditNozzle = (nozzle: Nozzle) => {
    setSelectedNozzle(nozzle);
    setEditNozzleModalOpen(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getAddButton = () => {
    if (activeTab === "pumps") {
      return (
        <Button onClick={() => setAddPumpModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pump
        </Button>
      );
    } else {
      return (
        <Button onClick={() => setAddNozzleModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Nozzle
        </Button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Pump & Nozzle Management"
        description="Manage pump hardware and nozzle assignments"
        actions={getAddButton()}
      />

      <Tabs 
        defaultValue="pumps" 
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="pumps">Pumps</TabsTrigger>
          <TabsTrigger value="nozzles">Nozzles</TabsTrigger>
        </TabsList>

        <TabsContent value="pumps">
          <PumpTable 
            onEdit={handleEditPump} 
            refresh={refreshTrigger}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="nozzles">
          <NozzleTable 
            onEdit={handleEditNozzle}
            refresh={refreshTrigger}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddPumpModal 
        open={addPumpModalOpen} 
        onOpenChange={setAddPumpModalOpen}
        onPumpAdded={handleRefresh}
      />
      
      <AddNozzleModal 
        open={addNozzleModalOpen} 
        onOpenChange={setAddNozzleModalOpen}
        onNozzleAdded={handleRefresh}
      />

      <EditPumpModal 
        open={editPumpModalOpen} 
        onOpenChange={setEditPumpModalOpen}
        pump={selectedPump}
        onPumpUpdated={handleRefresh}
      />

      <EditNozzleModal 
        open={editNozzleModalOpen} 
        onOpenChange={setEditNozzleModalOpen}
        nozzle={selectedNozzle}
        onNozzleUpdated={handleRefresh}
      />
    </div>
  );
};