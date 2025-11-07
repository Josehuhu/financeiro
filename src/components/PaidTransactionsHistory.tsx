import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { formatCurrency, formatDate, formatInstallment } from '../utils/formatters';
import type { Installment } from '../types';

interface PaidTransactionsHistoryProps {
  paidInstallments: Installment[];
}

export function PaidTransactionsHistory({ paidInstallments }: PaidTransactionsHistoryProps) {
  const sortedPaid = [...paidInstallments].sort((a, b) => {
    if (!a.paidDate || !b.paidDate) return 0;
    return b.paidDate.getTime() - a.paidDate.getTime();
  });

  return (
    <Card className="p-6">
      <h3 className="mb-4">Histórico de Pagamentos</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {sortedPaid.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma transação paga ainda
          </p>
        ) : (
          sortedPaid.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{item.transactionName}</span>
                  <Badge
                    variant={item.transactionType === 'INCOME' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {item.transactionType === 'INCOME' ? 'Receita' : 'Despesa'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatInstallment(item.installmentNumber, item.totalInstallments)}
                  </span>
                </div>
                {item.transactionDescription && (
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {item.transactionDescription}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Vencimento: {formatDate(item.dueDate)}</span>
                  {item.paidDate && <span>Pago em: {formatDate(item.paidDate)}</span>}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-mono ${
                    item.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.transactionType === 'INCOME' ? '+' : '-'} {formatCurrency(item.value)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
