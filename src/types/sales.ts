// types/sale.ts
export interface Sale {
  _id: string;
  transactionId: string;
  fuelType: string;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  paymentMode: string;
  nozzleman: {
    name: string;
  };
  createdAt: string;
  
  // Backend fields (optional for compatibility)
  liters?: number;
  price?: number;
  product?: {
    name: string;
  };
  customer?: {
    name: string;
  };
  nozzle?: {
    number: string;
  };
}