// pages/FuelStockPage.tsx - UPDATED VERSION WITHOUT ANIMATION
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Droplet,
  AlertTriangle,
  RefreshCw,
  History,
  Calendar,
  User,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Package,
  Minus,
  Table,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { FuelStockTable } from "@/components/Tables/FuelStockTable";
import { StockPurchaseModal } from "@/components/Modals/StockPurchaseModal";
import { StockAdjustment } from "@/components/Stock/StockAdjustment";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { QuickDipCalculator } from "../modules/QuickDipCalculator";
import { TankConfigModal } from "@/components/Modals/TankConfigModal";
import { CalibrationModal } from "@/components/Modals/CalibrationModal";
import api from "@/utils/api";

// Interfaces
interface TankConfig {
  _id: string;
  tankName: string;
  product: "MS" | "HSD";
  capacity: number;
  isActive: boolean;
  lastCalibrationBy?: string;
  createdAt: string;
  updatedAt: string;
  currentStock?: number;
  currentLevel?: number;
  alert?: boolean;
  avgDailyConsumption?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  dipFormula?: string;
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

// Tank Monitor Component
const FuelTankMonitor = ({
  tank,
  avgDailyConsumption = 500,
}: {
  tank: TankConfig;
  avgDailyConsumption?: number;
}) => {
  const [animate, setAnimate] = useState(false);
  const currentLiters = tank.currentStock || 0;
  const totalCapacity = tank.capacity || 10000;
  const percentage =
    totalCapacity > 0 ? (currentLiters / totalCapacity) * 100 : 0;

  useEffect(() => {
    setAnimate(true);
  }, [currentLiters]);

  const getColor = () => {
    if (percentage > 50)
      return {
        primary: "#10b981",
        secondary: "#34d399",
        dark: "#059669",
        glow: "rgba(16, 185, 129, 0.5)",
        gradient: "from-emerald-400 to-emerald-600",
      };
    if (percentage >= 25)
      return {
        primary: "#f59e0b",
        secondary: "#fbbf24",
        dark: "#d97706",
        glow: "rgba(245, 158, 11, 0.5)",
        gradient: "from-amber-400 to-amber-600",
      };
    return {
      primary: "#ef4444",
      secondary: "#f87171",
      dark: "#dc2626",
      glow: "rgba(239, 68, 68, 0.5)",
      gradient: "from-red-400 to-red-600",
    };
  };

  const colors = getColor();

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      {/* Tank Body Only */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{ height: "420px" }}
      >
        <svg viewBox="0 0 400 420" className="absolute inset-0 w-full h-full">
          <rect
            width="400"
            height="420"
            fill={`url(#metalGradient-${tank._id})`}
            filter={`url(#metalTexture-${tank._id})`}
          />
          <rect
            width="400"
            height="420"
            fill={`url(#innerShadow-${tank._id})`}
          />

          {[105, 210, 315].map((y) => (
            <g key={y}>
              <line
                x1="0"
                y1={y}
                x2="400"
                y2={y}
                stroke="#475569"
                strokeWidth="3"
                opacity="0.6"
              />
              <line
                x1="0"
                y1={y}
                x2="400"
                y2={y}
                stroke="#94a3b8"
                strokeWidth="1"
                opacity="0.4"
              />
            </g>
          ))}

          {[105, 210, 315].map((y) =>
            [...Array(12)].map((_, i) => (
              <g key={`${y}-${i}`}>
                <circle
                  cx={20 + i * 32}
                  cy={y}
                  r="4"
                  fill="#1e293b"
                  stroke="#64748b"
                  strokeWidth="0.5"
                />
                <circle cx={20 + i * 32} cy={y} r="2.5" fill="#334155" />
              </g>
            ))
          )}
        </svg>

        {/* Fuel Liquid */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-[2500ms] ease-out ${animate ? "opacity-100" : "opacity-0"
            }`}
          style={{
            height: animate ? `${percentage}%` : "0%",
            transformOrigin: "bottom",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                ${colors.secondary}40 0%, 
                ${colors.secondary}80 10%,
                ${colors.primary}dd 50%,
                ${colors.dark}ff 100%)`,
              boxShadow: `inset 0 4px 60px rgba(0,0,0,0.5), 
                          inset -20px 0 40px rgba(0,0,0,0.3),
                          inset 20px 0 40px rgba(0,0,0,0.3),
                          0 -8px 40px ${colors.glow}`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-24">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)`,
                }}
              ></div>
            </div>

            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/30 backdrop-blur-sm"
                style={{
                  width: `${4 + (i % 3) * 2}px`,
                  height: `${4 + (i % 3) * 2}px`,
                  left: `${10 + i * 11}%`,
                  bottom: `${15 + (i % 4) * 15}%`,
                  animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                  boxShadow: "inset -1px -1px 2px rgba(255,255,255,0.5)",
                }}
              ></div>
            ))}

            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
                            radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                animation: "caustics 8s ease-in-out infinite",
              }}
            ></div>
          </div>
        </div>

        {/* Measurement Scale - LEFT SIDE */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 25, 50, 75, 100].map((level) => (
            <div
              key={level}
              className="absolute left-0 flex items-center z-10"
              style={{ bottom: `${level}%` }}
            >
              <div className="bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-r-lg border border-slate-600 shadow-xl">
                <span className="text-slate-200 text-xs font-bold">
                  {level}%
                </span>
                <span className="text-slate-400 text-[10px] ml-1.5">
                  {((totalCapacity * level) / 100).toLocaleString()}L
                </span>
              </div>
              <div className="w-6 h-px bg-slate-500"></div>
            </div>
          ))}
        </div>

        {/* Dipstick */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-4 z-20">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #a16207 0%, #fbbf24 30%, #fef3c7 50%, #fbbf24 70%, #a16207 100%)",
              boxShadow:
                "inset -2px 0 4px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.3), 2px 0 8px rgba(0,0,0,0.3)",
            }}
          >
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 flex items-center"
                style={{ top: `${i * 5}%` }}
              >
                <div className="w-10 h-0.5 bg-red-900/80 shadow-sm"></div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-2xl border-2 border-yellow-900"></div>
        </div>

        {/* Current Level Indicator */}
        <div
          className={`absolute right-6 transition-all duration-[2500ms] ease-out z-30 ${animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          style={{ bottom: animate ? `calc(${percentage}% - 20px)` : "0%" }}
        >
          <div className="relative">
            <div
              className={`absolute -inset-2 bg-gradient-to-r ${colors.gradient} blur-xl opacity-60 animate-pulse`}
            ></div>

            <div
              className={`relative bg-gradient-to-r ${colors.gradient} text-white px-4 py-2.5 rounded-xl shadow-2xl border-2 border-white/30`}
            >
              <div className="flex items-center gap-2.5">
                <Droplet className="w-6 h-6" fill="currentColor" />
                <div>
                  <div className="text-2xl font-black leading-none">
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="text-[10px] font-semibold opacity-90">
                    {currentLiters.toLocaleString()} LITERS
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
              <div className="w-6 h-0.5 bg-white/70"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/70 rotate-45 -translate-x-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export const FuelStockPage = () => {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<TankConfig | null>(null);
  const [tanks, setTanks] = useState<TankConfig[]>([]);
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [expandedTankId, setExpandedTankId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStockData();
  }, [refresh]);

  const fetchStockData = async () => {
    try {
      setLoading(true);

      const tanksResponse = await api.get("/api/tanks/config");
      const tankData = tanksResponse.data.tanks || [];

      const tanksWithDefaults = tankData.map((tank) => ({
        ...tank,
        currentStock: tank.currentStock || 0,
        currentLevel: tank.currentLevel || 0,
        alert: tank.alert || false,
        avgDailyConsumption: tank.avgDailyConsumption || 500,
      }));

      setTanks(tanksWithDefaults);

      // Auto-select first tank if none selected
      if (!selectedTankId && tanksWithDefaults.length > 0) {
        setSelectedTankId(tanksWithDefaults[0]._id);
        setSelectedTank(tanksWithDefaults[0]);
        setExpandedTankId(tanksWithDefaults[0]._id); // Auto-expand first tank
      }

      const transactionsResponse = await api.get("/api/stock/transactions");
      setTransactions(transactionsResponse.data);
    } catch (error: any) {
      console.error("Failed to fetch fuel stock data:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch fuel stock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTank = (tank: TankConfig) => {
    setSelectedTankId(tank._id);
    setSelectedTank(tank);
    setShowTransactionHistory(false);

    // Toggle expansion
    if (expandedTankId === tank._id) {
      setExpandedTankId(null);
    } else {
      setExpandedTankId(tank._id);
    }
  };

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

  const handleDirectPurchase = () => {
    if (!selectedTank) {
      toast({
        title: "Select a tank",
        description: "Please select a tank first to record purchase",
        variant: "destructive",
      });
      return;
    }
    setPurchaseModalOpen(true);
  };

  const getProductDetails = (product: "MS" | "HSD") => {
    const products = {
      MS: {
        name: "Petrol (MS)",
        color: "text-green-600",
        bgColor: "bg-green-50",
        gradient: "from-green-500 to-emerald-500",
      },
      HSD: {
        name: "Diesel (HSD)",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        gradient: "from-blue-500 to-cyan-500",
      },
    };
    return (
      products[product] || {
        name: product,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        gradient: "from-gray-500 to-slate-500",
      }
    );
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0";
    }
    return value.toLocaleString();
  };

  const selectedTankData = selectedTankId
    ? tanks.find((tank) => tank._id === selectedTankId) || null
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading tank stock data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Fuel Tank Monitor"
        description={`Real-time monitoring and management of fuel storage tanks`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setRefresh((prev) => !prev)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              {showTransactionHistory ? "Hide History" : "Show History"}
            </Button>
            <Button onClick={handleCreateTank}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Tank
            </Button>
          </div>
        }
      />

      {tanks.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="text-center py-12">
            <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tanks Configured</h3>
            <p className="text-muted-foreground mb-4">
              Get started by configuring your fuel storage tanks.
            </p>
            <Button onClick={handleCreateTank}>
              <Plus className="mr-2 h-4 w-4" />
              Configure First Tank
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Left Sidebar - Tank List with Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Tank</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on a tank to view details and quick actions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {tanks.map((tank) => {
                  const productDetails = getProductDetails(tank.product);
                  const isSelected = selectedTankId === tank._id;
                  const isExpanded = expandedTankId === tank._id;

                  return (
                    <div key={tank._id} className="space-y-3">
                      {/* Tank Selection Button */}
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-all ${isSelected
                            ? `bg-gradient-to-r ${productDetails.gradient} text-white shadow-lg`
                            : "bg-card hover:bg-accent border"
                          }`}
                        onClick={() => handleSelectTank(tank)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Droplet
                              className={`h-5 w-5 ${isSelected ? "text-white" : productDetails.color
                                }`}
                            />
                            <div>
                              <div
                                className={`font-medium ${isSelected ? "text-white" : ""
                                  }`}
                              >
                                {tank.tankName}
                              </div>
                              <div
                                className={`text-sm ${isSelected
                                    ? "text-white/80"
                                    : "text-muted-foreground"
                                  }`}
                              >
                                {productDetails.name}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${isSelected ? "bg-white/20" : "bg-primary/10"
                                }`}
                            >
                              {formatNumber(tank.currentLevel)}%
                            </div>
                            <div
                              className={`transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"
                                }`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions (Only shown for selected/expanded tank) */}
                      {isExpanded && (
                        <div className="pl-4 pr-2 space-y-2">
                          {/* Action Buttons - Only showing the 4 required actions */}
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setSelectedTank(tank);
                                setPurchaseModalOpen(true);
                              }}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Record Purchase
                            </Button>

                            <StockAdjustment
                              selectedTank={tank}
                              onAdjustmentAdded={fetchStockData}
                              className="w-full"
                              size="sm"
                            />

                            <QuickDipCalculator
                              selectedTank={tank}
                              className="w-full"
                              size="sm"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleCalibrateTank(tank)}
                              >
                                <Settings className="mr-1 h-3 w-3" />
                                Calibrate
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleEditTank(tank)}
                              >
                                <Settings className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                            </div>
                          </div>

                          {/* Tank Status */}
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Status:
                              </span>
                              <span
                                className={`font-medium ${tank.isActive
                                    ? "text-green-600"
                                    : "text-amber-600"
                                  }`}
                              >
                                {tank.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="text-muted-foreground">
                                Low Stock:
                              </span>
                              <span
                                className={`font-medium ${(tank.currentLevel || 0) < 25
                                    ? "text-red-600"
                                    : "text-green-600"
                                  }`}
                              >
                                {(tank.currentLevel || 0) < 25
                                  ? "⚠️ Yes"
                                  : "✓ No"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tank Monitor */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTankData ? (
              <>
                {/* Tank Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold">
                          {selectedTankData.tankName} -{" "}
                          {selectedTankData.product === "MS"
                            ? "PETROL"
                            : "DIESEL"}{" "}
                          TANK
                        </h1>
                        <p className="text-muted-foreground">
                          Underground Storage Tank • Last updated:{" "}
                          {new Date(
                            selectedTankData.updatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold">
                            {formatNumber(selectedTankData.currentLevel)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Level
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">
                            {formatNumber(selectedTankData.currentStock)}L
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Stock
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">
                            {formatNumber(selectedTankData.capacity)}L
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Max Capacity
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tank Visualization */}
                <Card>
                  <CardContent className="p-6">
                    <FuelTankMonitor
                      tank={selectedTankData}
                      avgDailyConsumption={
                        selectedTankData.avgDailyConsumption || 500
                      }
                    />
                  </CardContent>
                </Card>

                {/* Tank Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tank Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Product Type
                          </div>
                          <div
                            className={`font-medium ${getProductDetails(selectedTankData.product).color
                              }`}
                          >
                            {getProductDetails(selectedTankData.product).name}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Status
                          </div>
                          <div
                            className={`font-medium ${selectedTankData.isActive
                                ? "text-green-600"
                                : "text-amber-600"
                              }`}
                          >
                            {selectedTankData.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Calculation Method
                          </div>
                          <div className="font-medium flex items-center gap-2">
                            <Table className="h-4 w-4" />
                            {selectedTankData.product === "MS"
                              ? "MS Formula"
                              : "HSD Formula"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Daily Consumption
                          </div>
                          <div className="font-medium">
                            {(
                              selectedTankData.avgDailyConsumption || 500
                            ).toLocaleString()}
                            L/day
                          </div>
                        </div>
                      </div>

                      {selectedTankData.lastCalibrationBy && (
                        <div className="pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Last Calibration
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>by {selectedTankData.lastCalibrationBy}</span>
                            <span className="text-muted-foreground text-sm">
                              •{" "}
                              {new Date(
                                selectedTankData.updatedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stock Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              Available Capacity
                            </span>
                            <span className="font-medium">
                              {formatNumber(
                                selectedTankData.capacity -
                                (selectedTankData.currentStock || 0)
                              )}
                              L
                            </span>
                          </div>
                          <Progress
                            value={selectedTankData.currentLevel || 0}
                            className="h-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                              Days Remaining
                            </div>
                            <div className="text-2xl font-bold">
                              {Math.floor(
                                (selectedTankData.currentStock || 0) /
                                (selectedTankData.avgDailyConsumption || 500)
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              at current usage
                            </div>
                          </div>

                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                              Low Stock Alert
                            </div>
                            <div
                              className={`text-2xl font-bold ${(selectedTankData.currentLevel || 0) < 25
                                  ? "text-destructive"
                                  : "text-green-600"
                                }`}
                            >
                              {(selectedTankData.currentLevel || 0) < 25
                                ? "YES"
                                : "NO"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              &lt;25% capacity
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transaction History Section (Conditional) */}
                {showTransactionHistory && (
                  <Card>
                  
                      <FuelStockTable
                        transactions={transactions.filter(
                          (t) => t.tank === selectedTankData._id
                        )}
                        onRefresh={fetchStockData}
                      />
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Tank</h3>
                  <p className="text-muted-foreground mb-4">
                    Please select a tank from the left sidebar to view its
                    monitoring dashboard
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <StockPurchaseModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        onPurchaseAdded={fetchStockData}
        selectedTank={selectedTank}
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
