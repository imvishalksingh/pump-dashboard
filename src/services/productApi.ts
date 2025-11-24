import api from "@/utils/api";

const API_BASE = "";

export const productApi = {
  // Product endpoints
  getProducts: () => api.get(`/api/products`),
  getProduct: (id: string) => api.get(`/api/products/${id}`),
  createProduct: (data: any) => api.post(`/api${API_BASE}/products`, data),
  updateProduct: (id: string, data: any) => api.put(`/api${API_BASE}/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`${API_BASE}/products/${id}`),

  // Price endpoints - FIXED: Added proper data structure
  updatePrice: (productId: string, data: { newPrice: string; reason?: string }) => 
    api.put(`/api${API_BASE}/prices/update-price/${productId}`, {
      newPrice: data.newPrice,
      reason: data.reason || "Price update requested"
    }),
  
  getPriceHistory: (productId: string) => api.get(`/api/prices/history/${productId}`),
  getAllPriceHistory: () => api.get(`/api/prices/price-history/all`),
  getCurrentPrices: () => api.get(`/api/prices/price-history/current`),
  approvePriceChange: (historyId: string) => api.put(`/api${API_BASE}/prices/approve/${historyId}`),
  rejectPriceChange: (historyId: string, data: { reason?: string }) => 
    api.put(`/api${API_BASE}/prices/reject/${historyId}`, { reason: data.reason }),
};