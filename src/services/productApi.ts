import api from "@/utils/api";

const API_BASE = "/api";

export const productApi = {
  // Product endpoints
  getProducts: () => api.get(`${API_BASE}/products`),
  getProduct: (id: string) => api.get(`${API_BASE}/products/${id}`),
  createProduct: (data: any) => api.post(`${API_BASE}/products`, data),
  updateProduct: (id: string, data: any) => api.put(`${API_BASE}/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`${API_BASE}/products/${id}`),

  // Price endpoints - FIXED: Added proper data structure
  updatePrice: (productId: string, data: { newPrice: string; reason?: string }) => 
    api.put(`${API_BASE}/prices/update-price/${productId}`, {
      newPrice: data.newPrice,
      reason: data.reason || "Price update requested"
    }),
  
  getPriceHistory: (productId: string) => api.get(`${API_BASE}/prices/history/${productId}`),
  getAllPriceHistory: () => api.get(`${API_BASE}/prices/price-history/all`),
  getCurrentPrices: () => api.get(`${API_BASE}/prices/price-history/current`),
  approvePriceChange: (historyId: string) => api.put(`${API_BASE}/prices/approve/${historyId}`),
  rejectPriceChange: (historyId: string, data: { reason?: string }) => 
    api.put(`${API_BASE}/prices/reject/${historyId}`, { reason: data.reason }),
};