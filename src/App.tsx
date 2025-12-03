import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PrivateRoute } from "./routes/PrivateRoute";
import { ROLES } from "./utils/roles";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import Sales from "./pages/Sales";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";
import UsersPage from "./pages/UsersPage";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { PumpNozzleManagementPage } from "./pages/modules/PumpNozzleManagementPage";
import { FuelStockPage } from "./pages/modules/FuelStockPage";
import { SalesManagementPage } from "./pages/modules/SalesManagementPage";
import CreditCustomerPage from "./pages/modules/CreditCustomerPage";
import ExpenseCashPage from "./pages/modules/ExpenseCashPage";
import { PriceProductPage } from "./pages/modules/PriceProductPage";
// import AuditCompliancePage from "./pages/modules/AuditCompliancePage";
import NotificationsPage from "./pages/modules/NotificationsPage";
import ReportsPage from "./pages/modules/ReportsPage";
import NozzlemanManagementPage from "./pages/modules/NozzlemanManagementPage";
import ErrorBoundar from "./components/ErrorBoundry"; // Add this import
import AdminInvitationsPanel from "./components/AdminInvitationsPanel"; // Add this import
import { cn } from "./lib/utils";
import { BackupManagement } from "./components/BackupManagement";
import { SalesManagementEditPage } from "./components/Sales/SalesManagementEditPage";



const queryClient = new QueryClient();

const AppContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes with layout */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="min-h-screen flex w-full bg-background">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className={cn(
                  "flex-1 flex flex-col transition-all duration-300",
                  sidebarCollapsed ? "ml-16" : "ml-64"
                )}>
                  <Navbar />
                  <main className="flex-1 p-6 overflow-auto">
                    <Routes>
                      {/* Dashboard Routes */}
                      <Route path="/" element={
                        <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                          <AdminDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/dashboard/manager" element={
                        <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
                          <ManagerDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/dashboard/auditor" element={
                        <PrivateRoute allowedRoles={[ROLES.AUDITOR]}>
                          <AuditorDashboard />
                        </PrivateRoute>
                      } />

                      {/* Admin Management Routes */}
                      <Route path="/admin/users" element={
                        <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                          <UsersPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/invitations" element={
                        <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                         <ErrorBoundar>
                              <AdminInvitationsPanel />
                          </ErrorBoundar>
                        </PrivateRoute>
                      } />
                      
                      {/* Core Application Routes */}
                      <Route path="/sales" element={<Sales />} />
                      <Route path="/stock" element={<Stock />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/settings" element={<Settings />} />

                      {/* Module Routes */}
                      <Route path="/pumps" element={<PumpNozzleManagementPage />} />
                      <Route path="/fuel-stock" element={<FuelStockPage />} />
                      {/* <Route path="/sales-management" element={<SalesManagementPage />} /> */}
                      <Route path="/nozzleman-management" element={<NozzlemanManagementPage />} />
                      <Route path="/credit-customers" element={<CreditCustomerPage />} />
                      <Route path="/expense-cash" element={<ExpenseCashPage />} />
                      <Route path="/price-products" element={<PriceProductPage />} />
                      {/* <Route path="/audit-compliance" element={<AuditCompliancePage />} /> */}
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/reports-analytics" element={<ReportsPage />} />
                      <Route  path="/backup-management" element={<BackupManagement />} />
                      <Route path="/sales-management/overview" element={<SalesManagementPage />} />
                      <Route path="/sales-management/edit" element={<SalesManagementEditPage />} />
                      <Route path="/sales-management" element={<Navigate to="/sales-management/overview" replace />} />

                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;