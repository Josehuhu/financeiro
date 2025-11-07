import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, formatDate, formatInstallment } from '../utils/formatters';
import type { Installment } from '../types';

interface PaidTransactionsTableProps {
  data: Installment[];
}

export function PaidTransactionsTable({ data }: PaidTransactionsTableProps) {
  const paidInstallments = data.filter(i => i.paid);

  if (paidInstallments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Transações já quitadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação paga ainda
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by paid date (most recent first)
  const sortedPaid = [...paidInstallments].sort((a, b) => {
    if (!a.paidDate || !b.paidDate) return 0;
    return new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
        <CardDescription>
          Total de {paidInstallments.length} transação(ões) paga(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Data de Vencimento</TableHead>
                <TableHead>Data de Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPaid.map((item, index) => (
                <TableRow key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/50'}>
                  <TableCell>{item.transactionName}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.transactionType === 'INCOME' ? 'default' : 'destructive'}
                      className="whitespace-nowrap"
                    >
                      {item.transactionType === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(item.value)}
                  </TableCell>
                  <TableCell>
                    {formatInstallment(item.installmentNumber, item.totalInstallments)}
                  </TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>
                    {item.paidDate ? formatDate(item.paidDate) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
