// pages/CreditCustomerPage.tsx - FIXED
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CreditSummaryCard } from "@/components/Widgets/CreditSummaryCard";
import { CreditCustomerTable } from "@/components/Tables/CreditCustomerTable";
import { LedgerTable } from "@/components/Tables/LedgerTable";
import { CreditCustomerFormModal } from "@/components/Modals/CreditCustomerFormModal";
import { LedgerPaymentModal } from "@/components/Modals/LedgerPaymentModal";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Customer {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  creditLimit: number;
  balance: number;
  address?: string;
  status: string;
  createdAt: string;
}

interface LedgerEntry {
  _id: string;
  customer: {
    _id: string;
    name: string;
    mobile: string;
  };
  type: string;
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  createdAt: string;
}

export default function CreditCustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersRes, ledgerRes] = await Promise.all([
        axios.get("/api/customers"),
        axios.get("/api/customers/ledger/all")
      ]);
      setCustomers(customersRes.data);
      setLedgerEntries(ledgerRes.data);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddCustomer = async (customerData: any) => {
    try {
      await axios.post("/api/customers", customerData);
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      setShowCustomerModal(false);
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  const handleEditCustomer = async (customerId: string, customerData: any) => {
    try {
      await axios.put(`/api/customers/${customerId}`, customerData);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      await axios.delete(`/api/customers/${customerId}`);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const handleRecordPayment = async (paymentData: any) => {
  try {
    console.log("🔵 START Payment Process");
    console.log("Payment Data:", paymentData);
    
    let customerId: string;

    if (paymentData.customerId) {
      customerId = paymentData.customerId;
      console.log("🔵 Using customerId from paymentData:", customerId);
    } else if (selectedCustomer) {
      customerId = selectedCustomer._id;
      console.log("🔵 Using selectedCustomer:", selectedCustomer);
    } else {
      console.log("🔴 No customer selected");
      toast({
        title: "Error",
        description: "No customer selected",
        variant: "destructive",
      });
      return;
    }

    const cleanPayload = {
      amount: Number(paymentData.amount),
      paymentDate: paymentData.paymentDate,
      notes: paymentData.notes
    };

    console.log("🔵 Sending to API - URL:", `/api/customers/${customerId}/payment`);
    console.log("🔵 Payload:", cleanPayload);

    const response = await axios.post(`/api/customers/${customerId}/payment`, cleanPayload);
    console.log("🟢 API Response:", response.data);

    toast({
      title: "Success",
      description: "Payment recorded successfully",
    });
    
    console.log("🟢 Closing modal and refreshing...");
    setShowPaymentModal(false);
    setSelectedCustomer(null);
    handleRefresh();
    
  } catch (error: any) {
    console.error("🔴 Payment Error:", error);
    console.log("🔴 Error Response:", error.response);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        "Failed to record payment";
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
};

  const handlePaymentClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPaymentModal(true);
  };

  // Handle Add Payment from Ledger tab
  const handleAddPaymentClick = () => {
    if (customers.length === 0) {
      toast({
        title: "No Customers",
        description: "Please add a customer first before recording payments",
        variant: "destructive",
      });
      return;
    }

    // If there's only one customer, select it automatically
    if (customers.length === 1) {
      setSelectedCustomer(customers[0]);
      setShowPaymentModal(true);
    } else {
      // If multiple customers, open modal with no customer pre-selected
      setSelectedCustomer(null);
      setShowPaymentModal(true);
    }
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);
  const activeCustomers = customers.filter(c => c.status === "Active").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Credit Customer & Ledger" 
          description="Manage customer credit accounts and payment tracking"
        />
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <CreditSummaryCard 
        totalCustomers={customers.length}
        outstandingCredit={totalOutstanding}
        paymentsDue={activeCustomers}
      />

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCustomerModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <CreditCustomerTable 
                customers={customers}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                onPayment={handlePaymentClick}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddPaymentClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <LedgerTable entries={ledgerEntries} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreditCustomerFormModal 
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleAddCustomer}
      />

      <LedgerPaymentModal 
        open={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleRecordPayment}
        customer={selectedCustomer}
        customers={customers}
      />
    </div>
  );
}