"use client";
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './components/ui/button';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { FinancialChart } from './components/FinancialChart';
import { PaidTransactionsHistory } from './components/PaidTransactionsHistory';
import { MonthlyHistory } from './components/MonthlyHistory';
import { useTransactions } from './hooks/useTransactions';
import { calculateInstallments } from './utils/installmentCalculator';
import { addMonths } from './utils/formatters';
import type { Transaction, Installment, TransactionFormData } from './types';

function AppContent() {
  const { user } = useAuth();
  const {
    transactions,
    installments,
    isLoading: dataLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateInstallment,
    createInstallment,
  } = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('User must be logged in to create transactions');
      }

      const newTransaction: Transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: data.name,
        type: data.type,
        description: data.description,
        totalValue: data.totalValue,
        installmentCount: data.installmentCount,
        startDate: data.startDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.email || 'unknown',
        createdByName: user.user_metadata?.name || user.email || 'unknown',
      };

      // Calculate installments
      const calculated = calculateInstallments(
        data.totalValue,
        data.installmentCount,
        data.startDate,
        data.customInstallments
      );

      // Create installment objects
      const currentDate = new Date();
      const newInstallments: Installment[] = calculated
        .filter((calc) => calc.dueDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
        .map((calc) => ({
          id: `inst_${newTransaction.id}_${calc.installmentNumber}`,
          transactionId: newTransaction.id,
          transactionName: newTransaction.name,
          transactionType: newTransaction.type,
          transactionDescription: newTransaction.description,
          installmentNumber: calc.installmentNumber,
          totalInstallments: data.installmentCount,
          value: calc.value,
          dueDate: calc.dueDate,
          paid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.email || 'unknown',
          createdByName: user.user_metadata?.name || user.email || 'unknown',
        }));

      await createTransaction(newTransaction, newInstallments);
      setIsModalOpen(false);
      toast.success('Transação criada com sucesso!');
    } catch (err) {
      console.error('Error creating transaction:', err);
      toast.error('Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;
    if (!user) {
      throw new Error('User must be logged in to edit transactions');
    }

    setIsSubmitting(true);

    try {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        name: data.name,
        type: data.type,
        description: data.description,
        totalValue: data.totalValue,
        installmentCount: data.installmentCount,
        startDate: data.startDate,
        updatedAt: new Date(),
      };

      // Recalculate installments
      const calculated = calculateInstallments(
        data.totalValue,
        data.installmentCount,
        data.startDate,
        data.customInstallments
      );

      const currentDate = new Date();
      const newInstallments: Installment[] = calculated
        .filter((calc) => calc.dueDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
        .map((calc) => ({
          id: `inst_${updatedTransaction.id}_${calc.installmentNumber}`,
          transactionId: updatedTransaction.id,
          transactionName: updatedTransaction.name,
          transactionType: updatedTransaction.type,
          transactionDescription: updatedTransaction.description,
          installmentNumber: calc.installmentNumber,
          totalInstallments: data.installmentCount,
          value: calc.value,
          dueDate: calc.dueDate,
          paid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.email || 'unknown',
          createdByName: user.user_metadata?.name || user.email || 'unknown',
        }));

      await updateTransaction(updatedTransaction, newInstallments);
      setIsModalOpen(false);
      setEditingTransaction(undefined);
      toast.success('Transação atualizada com sucesso!');
    } catch (err) {
      console.error('Error updating transaction:', err);
      toast.error('Erro ao atualizar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      toast.success('Transação deletada com sucesso!');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error('Erro ao deletar transação');
    }
  };

  const handleValidateInstallment = async (installmentId: string) => {
    const installment = installments.find((i) => i.id === installmentId);
    if (!installment) return;

    if (!user) {
      throw new Error('User must be logged in to validate installments');
    }

    try {
      // Mark as paid
      await updateInstallment(installmentId, {
        paid: true,
        paidDate: new Date(),
        validatedBy: user.email || 'unknown',
        validatedByName: user.user_metadata?.name || user.email || 'unknown',
      });

      // Check if there's a next installment to create
      const nextInstallmentNumber = installment.installmentNumber + 1;
      const hasNextInstallment = nextInstallmentNumber <= installment.totalInstallments;

      if (hasNextInstallment) {
        const transaction = transactions.find((t) => t.id === installment.transactionId);
        if (transaction) {
          // Calculate the next installment
          const calculated = calculateInstallments(
            transaction.totalValue,
            transaction.installmentCount,
            new Date(transaction.startDate)
          );

          const nextInstallmentCalc = calculated.find((c) => c.installmentNumber === nextInstallmentNumber);

          if (nextInstallmentCalc) {
            // Check if next installment doesn't already exist
            const nextExists = installments.some(
              (i) => i.transactionId === transaction.id && i.installmentNumber === nextInstallmentNumber
            );

            if (!nextExists) {
              if (!user) {
                throw new Error('User must be logged in to create installments');
              }

              const nextInstallment: Installment = {
                id: `inst_${transaction.id}_${nextInstallmentNumber}`,
                transactionId: transaction.id,
                transactionName: transaction.name,
                transactionType: transaction.type,
                transactionDescription: transaction.description,
                installmentNumber: nextInstallmentNumber,
                totalInstallments: transaction.installmentCount,
                value: nextInstallmentCalc.value,
                dueDate: nextInstallmentCalc.dueDate,
                paid: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: user.email || 'unknown',
                createdByName: user.user_metadata?.name || user.email || 'unknown',
              };

              await createInstallment(nextInstallment);
            }
          }
        }

        toast.success('Parcela marcada como paga! Próxima parcela adicionada.');
      } else {
        toast.success('Última parcela marcada como paga! Transação concluída.');
      }
    } catch (err) {
      console.error('Error validating installment:', err);
      toast.error('Erro ao validar parcela');
    }
  };

  const handleEditClick = (installment: Installment) => {
    const transaction = transactions.find((t) => t.id === installment.transactionId);
    if (transaction) {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
  };

  const handleModalSubmit = (data: TransactionFormData) => {
    if (editingTransaction) {
      handleEditTransaction(data);
    } else {
      handleCreateTransaction(data);
    }
  };

  // Separate paid and unpaid installments
  const unpaidInstallments = installments.filter((i) => !i.paid);
  const paidInstallments = installments.filter((i) => i.paid);

  // Calculate totals for unpaid
  const totalIncome = unpaidInstallments
    .filter((i) => i.transactionType === 'INCOME')
    .reduce((sum, i) => sum + i.value, 0);

  const totalExpense = unpaidInstallments
    .filter((i) => i.transactionType === 'EXPENSE')
    .reduce((sum, i) => sum + i.value, 0);

  const balance = totalIncome - totalExpense;

  // Calculate totals for paid
  const paidIncome = paidInstallments
    .filter((i) => i.transactionType === 'INCOME')
    .reduce((sum, i) => sum + i.value, 0);

  const paidExpense = paidInstallments
    .filter((i) => i.transactionType === 'EXPENSE')
    .reduce((sum, i) => sum + i.value, 0);

  const paidBalance = paidIncome - paidExpense;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Sistema de Gestão Financeira</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas com suporte a parcelamento
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground mb-1">Receitas Pendentes</div>
            <div className="text-green-600">
              R$ {totalIncome.toFixed(2)}
            </div>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground mb-1">Despesas Pendentes</div>
            <div className="text-red-600">
              R$ {totalExpense.toFixed(2)}
            </div>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground mb-1">Saldo Pendente</div>
            <div className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
              R$ {balance.toFixed(2)}
            </div>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground mb-1">Resultado Pago</div>
            <div className={paidBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
              R$ {paidBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-8">
          <FinancialChart
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            paidIncome={paidIncome}
            paidExpense={paidExpense}
          />
        </div>

        {/* Tabs for Transactions */}
        <Tabs defaultValue="pending" className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="pending">
                Transações Pendentes ({unpaidInstallments.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Histórico de Pagamentos ({paidInstallments.length})
              </TabsTrigger>
              <TabsTrigger value="monthly">
                Histórico Mensal
              </TabsTrigger>
            </TabsList>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>

          <TabsContent value="pending">
            <TransactionTable
              data={unpaidInstallments}
              onEdit={handleEditClick}
              onDelete={handleDeleteTransaction}
              onValidate={handleValidateInstallment}
              isLoading={dataLoading}
            />
          </TabsContent>

          <TabsContent value="paid">
            <PaidTransactionsHistory paidInstallments={paidInstallments} />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyHistory />
          </TabsContent>
        </Tabs>

        {/* Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          initialData={editingTransaction}
          isLoading={isSubmitting}
        />

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <AppContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}

export default App;
