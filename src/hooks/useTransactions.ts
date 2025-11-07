import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Transaction, Installment } from '../types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4acf5479`;

const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

import monthlyHistory from '../services/monthlyHistory';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [transactionsData, installmentsData] = await Promise.all([
        fetchAPI('/transactions'),
        fetchAPI('/installments'),
      ]);

      setTransactions(transactionsData.transactions || []);
      setInstallments((installmentsData.installments || []).map((inst: any) => ({
        ...inst,
        dueDate: new Date(inst.dueDate),
        createdAt: new Date(inst.createdAt),
        updatedAt: new Date(inst.updatedAt),
        paidDate: inst.paidDate ? new Date(inst.paidDate) : undefined,
      })));
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createTransaction = async (transaction: Transaction, installments: Installment[]) => {
    try {
      await fetchAPI('/transactions', {
        method: 'POST',
        body: JSON.stringify({ transaction, installments }),
      });

      // Record in monthly history (store the creation event in the month it occurs)
      try {
        monthlyHistory.recordEvent('TRANSACTION_CREATED', { transaction, installments }, new Date());
      } catch (e) {
        console.warn('Failed to record monthly history for transaction create', e);
      }

      await loadData();
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (transaction: Transaction, installments: Installment[]) => {
    try {
      await fetchAPI(`/transactions/${transaction.id}`, {
        method: 'PUT',
        body: JSON.stringify({ transaction, installments }),
      });

      try {
        monthlyHistory.recordEvent('TRANSACTION_UPDATED', { transaction, installments }, new Date());
      } catch (e) {
        console.warn('Failed to record monthly history for transaction update', e);
      }

      await loadData();
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await fetchAPI(`/transactions/${id}`, {
        method: 'DELETE',
      });

      try {
        monthlyHistory.recordEvent('TRANSACTION_DELETED', { id }, new Date());
      } catch (e) {
        console.warn('Failed to record monthly history for transaction delete', e);
      }

      await loadData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const updateInstallment = async (id: string, updates: Partial<Installment>) => {
    try {
      // find current installment to enrich event payload
      const current = installments.find((i) => i.id === id);

      await fetchAPI(`/installments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      // If marked as paid, record an INSTALLMENT_PAID event. Otherwise, record a generic update.
      try {
        if (updates.paid === true) {
          monthlyHistory.recordEvent('INSTALLMENT_PAID', { id, updates, installment: current || null }, updates.paidDate ? new Date(updates.paidDate as any) : new Date());
        } else {
          monthlyHistory.recordEvent('INSTALLMENT_UPDATED', { id, updates, installment: current || null }, new Date());
        }
      } catch (e) {
        console.warn('Failed to record monthly history for installment update', e);
      }

      await loadData();
    } catch (err) {
      console.error('Error updating installment:', err);
      throw err;
    }
  };

  const createInstallment = async (installment: Installment) => {
    try {
      await fetchAPI('/installments', {
        method: 'POST',
        body: JSON.stringify(installment),
      });

      try {
        monthlyHistory.recordEvent('INSTALLMENT_CREATED', { installment }, new Date());
      } catch (e) {
        console.warn('Failed to record monthly history for installment create', e);
      }

      await loadData();
    } catch (err) {
      console.error('Error creating installment:', err);
      throw err;
    }
  };

  return {
    transactions,
    installments,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateInstallment,
    createInstallment,
    refresh: loadData,
  };
};
