import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2, CalendarIcon } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { validateCustomInstallments } from '../utils/installmentCalculator';
import type { InstallmentCalculation } from '../utils/installmentCalculator';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

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
  }, [installments]);

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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(dates[index])}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dates[index]}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        const newDates = [...dates];
                        newDates[index] = date;
                        setDates(newDates);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
