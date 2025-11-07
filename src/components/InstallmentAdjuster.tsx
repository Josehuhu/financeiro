import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { validateCustomInstallments } from '../utils/installmentCalculator';
import type { InstallmentCalculation } from '../utils/installmentCalculator';
import { DateButtonInput } from './ui/date-button-input';

interface InstallmentAdjusterProps {
  installments: InstallmentCalculation[];
  totalValue: number;
  onUpdate: (values: number[], dates?: Date[]) => void;
}

export function InstallmentAdjuster({ installments, totalValue, onUpdate }: InstallmentAdjusterProps) {
  const [values, setValues] = useState<number[]>(installments.map(i => i.value));
  const [dates, setDates] = useState<Date[]>(installments.map(i => i.dueDate));
  const [validation, setValidation] = useState<{ valid: boolean; sum: number; difference: number }>({
    valid: true,
    sum: totalValue,
    difference: 0,
  });

  useEffect(() => {
    setValues(installments.map(i => i.value));
    setDates(installments.map(i => i.dueDate));
    // Notificar o componente pai das alterações
    onUpdate(installments.map(i => i.value), installments.map(i => i.dueDate));
  }, [installments, onUpdate]);

  useEffect(() => {
    const result = validateCustomInstallments(values, totalValue);
    setValidation(result);
    if (result.valid) {
      onUpdate(values, dates);
    }
  }, [values, dates, totalValue, onUpdate]);

  const handleValueChange = (index: number, newValue: string) => {
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed) && parsed >= 0) {
      const newValues = [...values];
      newValues[index] = Number(parsed.toFixed(2));
      setValues(newValues);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {installments.map((installment, index) => (
          <div key={index} className="space-y-2 border p-4 rounded-lg">
            <Label htmlFor={`installment-${index}`}>
              Parcela {installment.installmentNumber}/{installments.length}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id={`installment-${index}`}
                type="number"
                step="0.01"
                min="0"
                value={values[index]}
                onChange={(e) => handleValueChange(index, e.target.value)}
                className="font-mono"
              />
              <DateButtonInput
                value={dates[index]}
                onChange={(date) => {
                  const newDates = [...dates];
                  newDates[index] = date;
                  setDates(newDates);
                  // Forçar a atualização imediata
                  onUpdate(values, newDates);
                }}
                min={new Date()}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <span>Total das parcelas:</span>
          <span className="font-mono">{formatCurrency(validation.sum)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <span>Valor total esperado:</span>
          <span className="font-mono">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {!validation.valid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Diferença de {formatCurrency(Math.abs(validation.difference))}.
            A soma das parcelas deve ser igual ao valor total.
          </AlertDescription>
        </Alert>
      )}

      {validation.valid && values.length > 1 && (
        <Alert className="border-green-200 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            As parcelas estão corretamente ajustadas!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
