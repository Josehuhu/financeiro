export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  description?: string;
  totalValue: number;
  installmentCount: number;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Installment {
  id: string;
  transactionId: string;
  transactionName: string;
  transactionType: TransactionType;
  transactionDescription?: string;
  installmentNumber: number;
  totalInstallments: number;
  value: number;
  dueDate: Date;
  paid: boolean;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFormData {
  name: string;
  type: TransactionType;
  description?: string;
  totalValue: number;
  installmentCount: number;
  startDate: Date;
  customInstallments?: number[];
}

export interface TableFilters {
  type?: TransactionType;
  paid?: boolean;
  search?: string;
  month?: number;
  year?: number;
}

export interface SortConfig {
  key: keyof Installment;
  direction: "asc" | "desc";
}

// Monthly history types
export type MonthlyEventType =
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_UPDATED'
  | 'TRANSACTION_DELETED'
  | 'INSTALLMENT_CREATED'
  | 'INSTALLMENT_UPDATED'
  | 'INSTALLMENT_PAID';

export interface MonthlyEvent {
  id: string;
  type: MonthlyEventType;
  timestamp: string; // ISO
  payload: any;
}

export interface MonthlyHistoryEntry {
  year: number;
  month: number; // 1-12
  events: MonthlyEvent[];
}
