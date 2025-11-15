import axios from "axios";

const API_BASE = "/api";

export const productApi = {
  // Product endpoints
  getProducts: () => axios.get(`${API_BASE}/products`),
  getProduct: (id: string) => axios.get(`${API_BASE}/products/${id}`),
  createProduct: (data: any) => axios.post(`${API_BASE}/products`, data),
  updateProduct: (id: string, data: any) => axios.put(`${API_BASE}/products/${id}`, data),
  deleteProduct: (id: string) => axios.delete(`${API_BASE}/products/${id}`),

  // Price endpoints - FIXED: Added proper data structure
  updatePrice: (productId: string, data: { newPrice: string; reason?: string }) => 
    axios.put(`${API_BASE}/prices/update-price/${productId}`, {
      newPrice: data.newPrice,
      reason: data.reason || "Price update requested"
    }),
  
  getPriceHistory: (productId: string) => axios.get(`${API_BASE}/prices/history/${productId}`),
  getAllPriceHistory: () => axios.get(`${API_BASE}/prices/price-history/all`),
  getCurrentPrices: () => axios.get(`${API_BASE}/prices/price-history/current`),
  approvePriceChange: (historyId: string) => axios.put(`${API_BASE}/prices/approve/${historyId}`),
  rejectPriceChange: (historyId: string, data: { reason?: string }) => 
    axios.put(`${API_BASE}/prices/reject/${historyId}`, { reason: data.reason }),
};