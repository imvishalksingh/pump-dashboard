export interface Product {
  _id: string;
  name: string;
  type: string;
  currentPrice: number; // This is number in the actual product
  unit: string;
  status: "Active" | "Inactive";
  lastUpdated: string;
  createdAt: string;
}

export interface PriceHistory {
  _id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  updatedBy: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  reason?: string;
  createdAt: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  pendingPriceChanges: number;
  recentlyUpdated: number;
}

// Form data uses strings for form inputs
export interface ProductFormData {
  name: string;
  type: string;
  currentPrice: string; // String in form, will be converted to number
  unit: string;
  status: "Active" | "Inactive";
}


// For API calls - the actual data structure sent to backend
export interface CreateProductData {
  name: string;
  type: string;
  currentPrice: number; // Number when sending to API
  unit: string;
  status: "Active" | "Inactive";
}

export interface ProductTableItem {
  _id: string;
  name: string;
  type: string;
  currentPrice: number;
  unit: string;
  status: "Active" | "Inactive";
  lastUpdated: string;
  createdAt: string;
}

export interface PriceUpdateData {
  productId: string;
  newPrice: string;
  reason?: string; // Add this field
}