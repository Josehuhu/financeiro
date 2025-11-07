import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Transaction, Installment, TransactionFormData } from '../types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4acf5479`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${publicAnonKey}`,
};

// Transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${BASE_URL}/transactions`, { headers });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data || [];
};

export const createTransaction = async (transaction: Transaction): Promise<Transaction> => {
  const response = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(transaction),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
  const response = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers,
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
};

// Installments
export const fetchInstallments = async (): Promise<Installment[]> => {
  const response = await fetch(`${BASE_URL}/installments`, { headers });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  
  // Convert date strings back to Date objects
  return (data.data || []).map((inst: any) => ({
    ...inst,
    dueDate: new Date(inst.dueDate),
    paidDate: inst.paidDate ? new Date(inst.paidDate) : undefined,
    createdAt: new Date(inst.createdAt),
    updatedAt: new Date(inst.updatedAt),
  }));
};

export const createInstallment = async (installment: Installment): Promise<Installment> => {
  const response = await fetch(`${BASE_URL}/installments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(installment),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const updateInstallment = async (id: string, updates: Partial<Installment>): Promise<Installment> => {
  const response = await fetch(`${BASE_URL}/installments/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const deleteInstallment = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/installments/${id}`, {
    method: 'DELETE',
    headers,
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
};
