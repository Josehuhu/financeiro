import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from './ui/card';
import { formatCurrency } from '../utils/formatters';

interface FinancialChartProps {
  totalIncome: number;
  totalExpense: number;
  paidIncome: number;
  paidExpense: number;
}

export function FinancialChart({ totalIncome, totalExpense, paidIncome, paidExpense }: FinancialChartProps) {
  const pendingData = [
    { name: 'Receitas Pendentes', value: totalIncome, color: '#10B981' },
    { name: 'Despesas Pendentes', value: totalExpense, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const paidData = [
    { name: 'Receitas Recebidas', value: paidIncome, color: '#059669' },
    { name: 'Despesas Pagas', value: paidExpense, color: '#DC2626' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pending Transactions Chart */}
      <Card className="p-6">
        <h3 className="mb-4 text-center">Transações Pendentes</h3>
        {pendingData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhuma transação pendente
          </div>
        )}
        <div className="mt-4 space-y-2">
          {pendingData.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-mono">{formatCurrency(item.value)}</span>
            </div>
          ))}
          <div className="pt-2 border-t flex justify-between">
            <span>Saldo Pendente:</span>
            <span className={`font-mono ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </span>
          </div>
        </div>
      </Card>

      {/* Paid Transactions Chart */}
      <Card className="p-6">
        <h3 className="mb-4 text-center">Transações Pagas</h3>
        {paidData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paidData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paidData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhuma transação paga
          </div>
        )}
        <div className="mt-4 space-y-2">
          {paidData.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-mono">{formatCurrency(item.value)}</span>
            </div>
          ))}
          <div className="pt-2 border-t flex justify-between">
            <span>Resultado:</span>
            <span className={`font-mono ${paidIncome - paidExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(paidIncome - paidExpense)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
