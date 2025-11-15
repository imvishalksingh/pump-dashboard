// types/ledger.ts
export interface LedgerEntry {
  _id: string;
  id?: string; // For backward compatibility
  customer: {
    _id: string;
    name: string;
    mobile: string;
  };
  customerId?: string; // For backward compatibility
  customerName?: string; // For backward compatibility
  type: string;
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  date?: string; // For backward compatibility
  createdAt: string;
}