// pages/FuelStockPage.tsx - UPDATED WITH INTEGRATED TANK MANAGEMENT
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Droplet, AlertTriangle, TrendingUp, Download, RefreshCw, TrendingDown, Package, Minus, Table, Calendar, User, Settings } from "lucide-react";
import { FuelStockTable } from "@/components/Tables/FuelStockTable";
import { StockPurchaseModal } from "@/components/Modals/StockPurchaseModal";
import { StockAdjustment } from "@/components/Stock/StockAdjustment";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { QuickDipCalculator } from "../modules/QuickDipCalculator";
import { TankConfigModal } from "@/components/Modals/TankConfigModal";
import { CalibrationModal } from "@/components/Modals/CalibrationModal";
import api from "@/utils/api";

// Combined interfaces
interface TankConfig {
  _id: string;
  tankName: string;
  product: string;
  capacity: number;
  tankShape: string;
  dimensions: {
    length?: number;
    diameter?: number;
    width?: number;
    height?: number;
  };
  calibrationTable: Array<{
    dipMM: number;
    volumeLiters: number;
  }>;
  isActive: boolean;
  calibrationDate: string;
  lastCalibrationBy?: string;
  createdAt: string;
  currentStock?: number;
  currentLevel?: number;
  alert?: boolean;
  lastCalibrationDate?: string;
}

interface StockTransaction {
  _id: string;
  tank: string;
  tankName: string;
  product: string;
  transactionType: "purchase" | "sale" | "adjustment";
  quantity: number;
  previousStock: number;
  newStock: number;
  rate?: number;
  amount?: number;
  supplier?: string;
  invoiceNumber?: string;
  reason?: string;
  date: string;
  createdAt: string;
}

interface StockStats {
  totalCapacity: number;
  totalCurrent: number;
  averageLevel: number;
  lowStockAlerts: number;
  totalTanks: number;
}

export const FuelStockPage = () => {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<TankConfig | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStockData();
  }, [refresh]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      
      // Fetch tank configuration and stock data
      const tanksResponse = await api.get("/api/tanks/config");
      const tankData = tanksResponse.data.tanks || [];
      setTanks(tankData);
      
      // Fetch stock transactions
      const transactionsResponse = await api.get("/api/stock/transactions");
      setTransactions(transactionsResponse.data);
      
      // Calculate stats from tank data
      const totalCapacity = tankData.reduce((sum: number, tank: TankConfig) => sum + tank.capacity, 0);
      const totalCurrent = tankData.reduce((sum: number, tank: TankConfig) => sum + (tank.currentStock || 0), 0);
      const averageLevel = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;
      const lowStockAlerts = tankData.filter((tank: TankConfig) => tank.alert).length;

      setStats({
        totalCapacity,
        totalCurrent,
        averageLevel,
        lowStockAlerts,
        totalTanks: tankData.length
      });
      
    } catch (error: any) {
      console.error("Failed to fetch fuel stock data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch fuel stock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tank Management Functions
  const handleCreateTank = () => {
    setSelectedTank(null);
    setConfigModalOpen(true);
  };

  const handleEditTank = (tank: TankConfig) => {
    setSelectedTank(tank);
    setConfigModalOpen(true);
  };

  const handleCalibrateTank = (tank: TankConfig) => {
    setSelectedTank(tank);
    setCalibrationModalOpen(true);
  };

  const handleDeleteTank = async (tankId: string) => {
    if (!confirm("Are you sure you want to delete this tank configuration?")) {
      return;
    }

    try {
      await api.delete(`/api/tanks/config/${tankId}`);
      toast({
        title: "Success",
        description: "Tank configuration deleted successfully",
      });
      fetchStockData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tank configuration",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  // Tank helper functions
  const getTankShapeName = (shape: string) => {
    const shapes: { [key: string]: string } = {
      horizontal_cylinder: "Horizontal Cylinder",
      rectangular: "Rectangular",
      capsule: "Capsule",
      custom: "Custom"
    };
    return shapes[shape] || shape;
  };

  const getDimensionsText = (tank: TankConfig) => {
    const { dimensions, tankShape } = tank;
    
    switch (tankShape) {
      case "horizontal_cylinder":
        return `⌀${dimensions.diameter}m × ${dimensions.length}m`;
      case "rectangular":
        return `${dimensions.length}m × ${dimensions.width}m × ${dimensions.height}m`;
      case "capsule":
        return `⌀${dimensions.diameter}m × ${dimensions.length}m (Capsule)`;
      default:
        return "Custom dimensions";
    }
  };

  const getTankVolumeInfo = (tank: TankConfig) => {
    const { dimensions, tankShape } = tank;
    
    switch (tankShape) {
      case "horizontal_cylinder":
        if (dimensions.diameter && dimensions.length) {
          const radius = dimensions.diameter / 2;
          const volume = Math.PI * Math.pow(radius, 2) * dimensions.length;
          return volume.toFixed(2) + ' m³';
        }
        break;
        
      case "rectangular":
        if (dimensions.length && dimensions.width && dimensions.height) {
          const volume = dimensions.length * dimensions.width * dimensions.height;
          return volume.toFixed(2) + ' m³';
        }
        break;
        
      case "capsule":
        if (dimensions.diameter && dimensions.length) {
          const radius = dimensions.diameter / 2;
          const cylinderLength = dimensions.length - dimensions.diameter;
          const cylinderVolume = Math.PI * Math.pow(radius, 2) * cylinderLength;
          const sphereVolume = (4/3) * Math.PI * Math.pow(radius, 3);
          const volume = cylinderVolume + sphereVolume;
          return volume.toFixed(2) + ' m³';
        }
        break;
    }
    
    return "Calculate volume after calibration";
  };

  // Safe number formatting function
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0";
    }
    return value.toLocaleString();
  };

  // Safe progress value
  const getProgressValue = (level: number | null | undefined): number => {
    if (level === null || level === undefined || isNaN(level)) {
      return 0;
    }
    return Math.max(0, Math.min(100, level));
  };

  // Calculate today's date for filtering
  const today = new Date().toDateString();

  // Calculate today's activity for each tank
  const getTodayActivity = (tankId: string) => {
    const todayTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date).toDateString();
      return transactionDate === today && transaction.tank === tankId;
    });

    const activity = {
      purchases: 0,
      sales: 0,
      adjustments: 0,
      added: 0,
      deducted: 0
    };

    todayTransactions.forEach(transaction => {
      if (transaction.transactionType === "purchase") {
        activity.purchases += transaction.quantity;
        activity.added += transaction.quantity;
      } else if (transaction.transactionType === "sale") {
        activity.sales += transaction.quantity;
        activity.deducted += transaction.quantity;
      } else if (transaction.transactionType === "adjustment") {
        activity.adjustments += transaction.quantity;
        if (transaction.quantity > 0) {
          activity.added += transaction.quantity;
        } else {
          activity.deducted += Math.abs(transaction.quantity);
        }
      }
    });

    return activity;
  };

  // Calculate transaction summary (ALL TIME DATA)
  const calculateTransactionSummary = () => {
    let totalPurchases = 0;
    let totalSales = 0;
    let totalAdjustmentsAdded = 0;
    let totalAdjustmentsDeducted = 0;

    transactions.forEach(transaction => {
      if (transaction.transactionType === "purchase") {
        totalPurchases += transaction.quantity;
      } else if (transaction.transactionType === "sale") {
        totalSales += transaction.quantity;
      } else if (transaction.transactionType === "adjustment") {
        if (transaction.quantity > 0) {
          totalAdjustmentsAdded += transaction.quantity;
        } else {
          totalAdjustmentsDeducted += Math.abs(transaction.quantity);
        }
      }
    });

    return {
      totalPurchases,
      totalSales,
      totalAdjustmentsAdded,
      totalAdjustmentsDeducted,
      purchaseTransactions: transactions.filter(t => t.transactionType === "purchase").length,
      salesTransactions: transactions.filter(t => t.transactionType === "sale").length,
      adjustmentTransactions: transactions.filter(t => t.transactionType === "adjustment").length
    };
  };

  const transactionSummary = calculateTransactionSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading tank stock data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Fuel Stock & Tank Management"
        description={`Monitor fuel inventory and manage tank configurations across ${tanks.length} tanks`}
        actions={
          <div className="flex gap-2">
            <QuickDipCalculator />
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <StockAdjustment onAdjustmentAdded={handleRefresh} />
            <Button onClick={() => setPurchaseModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Purchase
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Stock Overview</TabsTrigger>
          <TabsTrigger value="tanks">Tank Management</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        {/* STOCK OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Transaction Summary Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(transactionSummary.totalPurchases)} L
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {transactionSummary.purchaseTransactions} purchase transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(transactionSummary.totalSales)} L
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Stock Added</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(transactionSummary.totalAdjustmentsAdded)} L
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Through adjustments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Stock Deducted</CardTitle>
                <Minus className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(transactionSummary.totalAdjustmentsDeducted)} L
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Through adjustments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tank Cards with Today's Activity */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tanks.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tanks Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by configuring your fuel storage tanks.
                  </p>
                  <Button onClick={() => setActiveTab("tanks")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Configure Tanks
                  </Button>
                </CardContent>
              </Card>
            ) : (
              tanks.map((tank) => {
                const todayActivity = getTodayActivity(tank._id);
                const hasActivity = todayActivity.added > 0 || todayActivity.deducted > 0 || 
                                  todayActivity.purchases > 0 || todayActivity.sales > 0;

                return (
                  <Card key={tank._id} className="relative">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-600" />
                        {tank.tankName}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {todayActivity.added > 0 && (
                          <Plus className="h-3 w-3 text-green-500" />
                        )}
                        {todayActivity.deducted > 0 && (
                          <Minus className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Main Stock Info */}
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold">{formatNumber(tank.currentStock)} L</div>
                        <div className="text-sm text-muted-foreground">
                          / {formatNumber(tank.capacity)} L
                        </div>
                      </div>
                      <Progress value={getProgressValue(tank.currentLevel)} />
                      
                      {/* Stock Level and Alert */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={tank.alert ? "text-destructive font-medium" : "text-muted-foreground"}>
                          {formatNumber(tank.currentLevel)}% Full
                        </span>
                        {tank.alert && (
                          <span className="flex items-center text-destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Product:</span>
                        <div className="font-medium">{tank.product}</div>
                      </div>

                      {/* Today's Activity */}
                      <div className="border-t pt-2 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Today's Activity:</p>
                        
                        {/* Purchases */}
                        {todayActivity.purchases > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-green-600 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Purchased:
                            </span>
                            <span className="font-semibold text-green-600">
                              +{formatNumber(todayActivity.purchases)} L
                            </span>
                          </div>
                        )}

                        {/* Sales */}
                        {todayActivity.sales > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-orange-600 flex items-center">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Sold:
                            </span>
                            <span className="font-semibold text-orange-600">
                              -{formatNumber(todayActivity.sales)} L
                            </span>
                          </div>
                        )}

                        {/* Adjustments Added */}
                        {todayActivity.added > 0 && todayActivity.adjustments > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-blue-600 flex items-center">
                              <Package className="h-3 w-3 mr-1" />
                              Adjusted:
                            </span>
                            <span className="font-semibold text-blue-600">
                              +{formatNumber(todayActivity.added)} L
                            </span>
                          </div>
                        )}

                        {/* Adjustments Deducted */}
                        {todayActivity.deducted > 0 && todayActivity.adjustments > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-red-600 flex items-center">
                              <Minus className="h-3 w-3 mr-1" />
                              Adjusted:
                            </span>
                            <span className="font-semibold text-red-600">
                              -{formatNumber(todayActivity.deducted)} L
                            </span>
                          </div>
                        )}

                        {/* No activity today */}
                        {!hasActivity && (
                          <div className="text-xs text-muted-foreground text-center">
                            No activity today
                          </div>
                        )}
                      </div>

                      {/* Calibration Status */}
                      <div className="text-xs text-muted-foreground">
                        Calibration: {tank.calibrationTable?.length || 0} points
                        {tank.lastCalibrationDate && (
                          <span> • {new Date(tank.lastCalibrationDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Droplet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats?.totalCapacity)} L</div>
                <p className="text-xs text-muted-foreground mt-1">Across {stats?.totalTanks} tanks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats?.totalCurrent)} L</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(stats?.averageLevel)}% average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats?.averageLevel)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Across all tanks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatNumber(stats?.lowStockAlerts)}</div>
                <p className="text-xs text-muted-foreground mt-1">Tanks below 20%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TANK MANAGEMENT TAB */}
        <TabsContent value="tanks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tank Configuration</h2>
              <p className="text-muted-foreground">
                Configure and manage fuel storage tanks with certified calibration
              </p>
            </div>
            <Button onClick={handleCreateTank}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tank
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tanks.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tanks Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first fuel storage tank configuration.
                  </p>
                  <Button onClick={handleCreateTank}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Tank
                  </Button>
                </CardContent>
              </Card>
            ) : (
              tanks.map((tank) => (
                <Card key={tank._id} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-600" />
                      {tank.tankName}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCalibrateTank(tank)}
                        title="Calibrate tank"
                      >
                        <Table className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTank(tank)}
                        title="Edit tank"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Product:</span>
                        <div className="font-medium">{tank.product}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Capacity:</span>
                        <div className="font-medium">{tank.capacity.toLocaleString()} L</div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Shape:</span>
                      <div className="font-medium">{getTankShapeName(tank.tankShape)}</div>
                      <div className="text-xs text-muted-foreground">
                        {getDimensionsText(tank)}
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Calibration:</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(tank.calibrationDate).toLocaleDateString()}
                      </div>
                      {tank.lastCalibrationBy && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          by {tank.lastCalibrationBy}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {tank.calibrationTable?.length || 0} calibration points
                      </div>
                    </div>

                    {(!tank.calibrationTable || tank.calibrationTable.length === 0) && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertTriangle className="h-3 w-3" />
                        Calibration required
                      </div>
                    )}

                    {!tank.isActive && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Inactive
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TRANSACTION HISTORY TAB */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transaction History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete history of all stock movements across tanks
              </p>
            </CardHeader>
            <CardContent>
              <FuelStockTable 
                transactions={transactions} 
                onRefresh={handleRefresh} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <StockPurchaseModal 
        open={purchaseModalOpen} 
        onOpenChange={setPurchaseModalOpen}
        onPurchaseAdded={handleRefresh}
      />

      <TankConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        tank={selectedTank}
        onSuccess={fetchStockData}
      />

      <CalibrationModal
        open={calibrationModalOpen}
        onOpenChange={setCalibrationModalOpen}
        tank={selectedTank}
        onSuccess={fetchStockData}
      />
    </div>
  );
};