import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { ProductTable } from "@/components/Tables/ProductTable";
import { PriceHistoryTable } from "@/components/Tables/PriceHistoryTable";
import { ProductFormModal } from "@/components/Modals/ProductFormModal";
import { PriceUpdateModal } from "@/components/Modals/PriceUpdateModal";
import { useToast } from "@/hooks/use-toast";
import { 
  Product, 
  PriceHistory, 
  ProductStats, 
  ProductFormData, 
  PriceUpdateData, 
  ProductTableItem,
  CreateProductData 
} from "@/types/Product";
import { productApi } from "@/services/productApi";

export const PriceProductPage = () => {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsResponse, historyResponse] = await Promise.all([
        productApi.getProducts(),
        productApi.getAllPriceHistory()
      ]);
      
      setProducts(productsResponse.data);
      setPriceHistory(historyResponse.data);
      
      const productStats: ProductStats = {
        totalProducts: productsResponse.data.length,
        activeProducts: productsResponse.data.filter((p: Product) => p.status === "Active").length,
        pendingPriceChanges: historyResponse.data.filter((h: PriceHistory) => h.status === "Pending").length,
        recentlyUpdated: productsResponse.data.filter((p: Product) => {
          const lastUpdated = new Date(p.lastUpdated);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return lastUpdated > sevenDaysAgo;
        }).length
      };
      setStats(productStats);
      
    } catch (error: any) {
      console.error("Failed to fetch product data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch product data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      // Convert form data to API data structure
      const apiData: CreateProductData = {
        name: productData.name,
        type: productData.type,
        currentPrice: parseFloat(productData.currentPrice), // Convert string to number
        unit: productData.unit,
        status: productData.status
      };
      
      await productApi.createProduct(apiData);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setProductModalOpen(false);
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create product",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fix: Change to sync function to match the expected type
  const handleEditProduct = (product: ProductTableItem) => {
    // Open edit modal or handle edit logic
    setProductModalOpen(true);
    // You might want to pass the product data to the modal for editing
    console.log("Edit product:", product);
    toast({
      title: "Edit Feature",
      description: "Edit functionality to be implemented",
    });
  };

  // Fix: Change to sync function to match the expected type
  const handleDeleteProduct = (productId: string) => {
    // You can add a confirmation dialog here
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(productId);
    }
  };

  // Separate async function for actual deletion
  const deleteProduct = async (productId: string) => {
    try {
      await productApi.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handlePriceUpdate = async (priceData: PriceUpdateData) => {
  try {
    console.log("🟡 Submitting price update:", priceData);
    
    // Validate price
    const priceValue = parseFloat(priceData.newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return;
    }

    await productApi.updatePrice(priceData.productId, {
      newPrice: priceData.newPrice,
      reason: priceData.reason || "Price update requested"
    });
    
    toast({
      title: "Success",
      description: "Price update submitted for approval",
    });
    setPriceModalOpen(false);
    handleRefresh();
  } catch (error: any) {
    console.error("❌ Price update error:", error);
    
    // More detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        "Failed to update price";
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    throw error;
  }
};

  const handleApprovePrice = async (historyId: string) => {
    try {
      await productApi.approvePriceChange(historyId);
      toast({
        title: "Price Approved",
        description: "Price change has been approved and applied",
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve price",
        variant: "destructive",
      });
    }
  };

  const handleRejectPrice = async (historyId: string) => {
    try {
      await productApi.rejectPriceChange(historyId, { reason: "Rejected by admin" });
      toast({
        title: "Price Rejected",
        description: "Price change has been rejected",
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject price",
        variant: "destructive",
      });
    }
  };

  // Convert Product[] to ProductTableItem[] for the table
  const tableProducts: ProductTableItem[] = products.map(product => ({
    _id: product._id,
    name: product.name,
    type: product.type,
    currentPrice: product.currentPrice,
    unit: product.unit,
    status: product.status,
    lastUpdated: product.lastUpdated,
    createdAt: product.createdAt
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading product data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Price & Product Management"
        description="Manage products and price updates"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setPriceModalOpen(true)} variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Update Price
            </Button>
            <Button onClick={() => setProductModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">All products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Changes</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats?.pendingPriceChanges}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentlyUpdated}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Products and Price History */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Price History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product List</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductTable 
                products={tableProducts} 
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Price Change History</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceHistoryTable 
                history={priceHistory}
                onApprove={handleApprovePrice}
                onReject={handleRejectPrice}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ProductFormModal 
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        onSubmit={handleCreateProduct}
      />

      <PriceUpdateModal 
        open={priceModalOpen}
        onOpenChange={setPriceModalOpen}
        onSubmit={handlePriceUpdate}
        products={products}
      />
    </div>
  );
};