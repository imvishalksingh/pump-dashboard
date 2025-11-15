export interface RealExpense {
  _id: string;
  category: string;
  amount: number;
  description: string;
  addedBy: string;
  approvedBy?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}