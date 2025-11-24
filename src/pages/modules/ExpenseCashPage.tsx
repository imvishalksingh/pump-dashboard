import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseSummaryCard } from "@/components/Widgets/ExpenseSummaryCard";
import { ExpenseTable } from "@/components/Tables/ExpenseTable";
import { CashReconciliationTable } from "@/components/Tables/CashReconciliationTable";
import { ExpenseFormModal } from "@/components/Modals/ExpenseFormModal";
import { CashTransferModal } from "@/components/Modals/CashTransferModal";
import { ChartCard } from "@/components/Widgets/ChartCard";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { RealExpense } from "@/types/expense";

interface CashHandover {
  _id: string;
  shift: {
    _id: string;
    shiftId: string;
    startTime: string;
    endTime?: string;
  };
  nozzleman: {
    _id: string;
    name: string;
    employeeId: string;
  };
  amount: number;
  status: string;
  verifiedBy?: {
    name: string;
  };
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

export default function ExpenseCashPage() {
  const [expenses, setExpenses] = useState<RealExpense[]>([]);
  const [handovers, setHandovers] = useState<CashHandover[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RealExpense | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching expenses and cash handovers data...");
      
      // Fetch both expenses and cash handovers
      const [expensesRes, handoversRes] = await Promise.all([
        api.get("/api/expenses"),
        api.get("/api/cash-handovers")
      ]);
      
      console.log("📊 Expenses response:", expensesRes.data);
      console.log("📊 Cash handovers response:", handoversRes.data);
      
      setExpenses(expensesRes.data);
      setHandovers(handoversRes.data);
    } catch (error: any) {
      console.error("❌ Failed to fetch data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate today's expenses
  const todayExpense = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date).toDateString();
      const today = new Date().toDateString();
      return expenseDate === today;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const pendingCash = handovers
    .filter(h => h.status === "Pending")
    .reduce((sum, h) => sum + h.amount, 0);

  // Calculate total outflow for current month
  const totalOutflow = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Handle expense operations
  const handleAddExpense = async (expenseData: any) => {
    try {
      console.log("➕ Adding expense:", expenseData);
      const response = await api.post("/api/expenses", expenseData);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      setShowExpenseModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("❌ Failed to add expense:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const handleEditExpense = async (expenseData: any) => {
    if (!editingExpense) return;
    
    try {
      console.log("✏️ Editing expense:", editingExpense._id, expenseData);
      await api.put(`/api/expenses/${editingExpense._id}`, expenseData);
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      setShowExpenseModal(false);
      setEditingExpense(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("❌ Failed to update expense:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${expenseId}`);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    try {
      await api.put(`/api/expenses/${expenseId}/approve`);
      toast({
        title: "Success",
        description: "Expense approved successfully",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve expense",
        variant: "destructive",
      });
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    try {
      await api.put(`/api/expenses/${expenseId}/reject`);
      toast({
        title: "Success",
        description: "Expense rejected successfully",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject expense",
        variant: "destructive",
      });
    }
  };

  // Cash handover functions (unchanged)
  const handleVerifyCash = async (handoverId: string) => {
    try {
      console.log("✅ Verifying cash handover:", handoverId);
      await api.put(`/api/cash-handovers/${handoverId}/verify`);
      toast({
        title: "Success",
        description: "Cash handover verified and sale created",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("❌ Failed to verify cash handover:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify cash handover",
        variant: "destructive",
      });
    }
  };

  const handleRejectCash = async (handoverId: string, notes: string) => {
    try {
      await api.put(`/api/cash-handovers/${handoverId}/reject`, { notes });
      toast({
        title: "Success",
        description: "Cash handover rejected",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject cash handover",
        variant: "destructive",
      });
    }
  };

  // Prepare chart data from actual expenses
  const expenseChartData = expenses.reduce((acc: any[], expense) => {
    const existing = acc.find(item => item.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ category: expense.category, amount: expense.amount });
    }
    return acc;
  }, []);

  const handleExpenseSubmit = (data: any) => {
    if (editingExpense) {
      handleEditExpense(data);
    } else {
      handleAddExpense(data);
    }
  };

  const handleEditClick = (expense: RealExpense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expense & Cash Management" 
        description="Track expenses and cash flow" 
      />
      
      <div className="flex justify-between items-center">
        <ExpenseSummaryCard 
          todayExpense={todayExpense} 
          pendingCash={pendingCash} 
          totalOutflow={totalOutflow} 
        />
        <Button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="cash">Cash Handover</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowExpenseModal(true)}>
              <Plus className="mr-2 h-4 w-4" />Add Expense
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ExpenseTable 
                expenses={expenses} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteExpense}
                onApprove={handleApproveExpense}
                onReject={handleRejectExpense}
                loading={loading}
              />
            </CardContent>
          </Card>
          {expenseChartData.length > 0 && (
            <ChartCard 
              title="Expense Breakdown" 
              data={expenseChartData} 
              dataKey="amount" 
              xKey="category" 
            />
          )}
        </TabsContent>

        <TabsContent value="cash" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Cash Handovers</h3>
              <p className="text-sm text-muted-foreground">
                {handovers.length} total • {handovers.filter(h => h.status === "Pending").length} pending verification
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCashModal(true)}>
                <Plus className="mr-2 h-4 w-4" />Transfer Cash
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="animate-spin h-6 w-6 mr-2" />
                  <span>Loading cash handovers...</span>
                </div>
              ) : (
                <CashReconciliationTable 
                  handovers={handovers} 
                  onVerify={handleVerifyCash}
                  onReject={handleRejectCash}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpenseFormModal 
        open={showExpenseModal} 
        onClose={handleCloseExpenseModal} 
        onSubmit={handleExpenseSubmit}
        initialData={editingExpense}
      />
      <CashTransferModal 
        open={showCashModal} 
        onClose={() => setShowCashModal(false)} 
        onSubmit={() => {
          toast({ title: "Cash transferred" });
          setRefreshTrigger(prev => prev + 1);
        }} 
      />
    </div>
  );
}