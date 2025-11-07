import { useEffect, useState } from 'react';
import monthlyHistory from '../services/monthlyHistory';
import { Card } from './ui/card';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { MonthlyEvent } from '../types';

function monthLabel(y: number, m: number) {
  const dt = new Date(y, m - 1, 1);
  return dt.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

export function MonthlyHistory() {
  const [months, setMonths] = useState<{ year: number; month: number; events: MonthlyEvent[] }[]>([]);

  useEffect(() => {
    setMonths(monthlyHistory.getAllMonths());
  }, []);

  const handleClear = () => {
    if (!confirm('Remover todo o histórico mensal? Esta ação não pode ser desfeita.')) return;
    monthlyHistory.clearAllHistory();
    setMonths([]);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3>Histórico Mensal</h3>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={() => setMonths(monthlyHistory.getAllMonths())}>
            Atualizar
          </button>
          <button className="btn btn-sm text-destructive" onClick={handleClear}>
            Limpar
          </button>
        </div>
      </div>

      {months.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum histórico registrado ainda.</p>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {months.map((m) => (
            <div key={`${m.year}-${m.month}`} className="p-4 bg-muted/40 rounded">
              <h4 className="mb-2">{monthLabel(m.year, m.month)}</h4>
              <div className="space-y-2">
                {m.events.map((ev) => (
                  <div key={ev.id} className="flex justify-between items-start p-2 bg-card rounded">
                    <div className="text-sm">
                      <div className="font-medium">{ev.type.replaceAll('_', ' ')}</div>
                      <div className="text-xs text-muted-foreground">{new Date(ev.timestamp).toLocaleString()}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {typeof ev.payload === 'object' ? (
                          <pre className="text-xs max-w-xl overflow-auto">{JSON.stringify(ev.payload, null, 2)}</pre>
                        ) : (
                          String(ev.payload)
                        )}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      {/* If payload has value, show it */}
                      {ev.payload?.installment?.value != null && (
                        <div className={ev.payload?.installment?.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                          {ev.payload.installment.transactionType === 'INCOME' ? '+' : '-'} {formatCurrency(ev.payload.installment.value)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
