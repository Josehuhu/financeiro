import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatInstallment } from '../utils/formatters';
import { calculateInstallments } from '../utils/installmentCalculator';
import { validateName, validateDescription, validateValue, validateInstallmentCount, validateDate } from '../utils/validators';
import { InstallmentAdjuster } from './InstallmentAdjuster';
import type { TransactionFormData, Transaction } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Transaction;
  isLoading?: boolean;
}

export function TransactionModal({ isOpen, onClose, onSubmit, initialData, isLoading = false }: TransactionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<TransactionFormData>({
    name: '',
    type: 'EXPENSE',
    description: '',
    totalValue: 0,
    installmentCount: 1,
    startDate: new Date(),
  });
  const [useCustomInstallments, setUseCustomInstallments] = useState(false);
  const [customInstallmentValues, setCustomInstallmentValues] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description || '',
        totalValue: initialData.totalValue,
        installmentCount: initialData.installmentCount,
        startDate: new Date(initialData.startDate),
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        type: 'EXPENSE',
        description: '',
        totalValue: 0,
        installmentCount: 1,
        startDate: new Date(),
      });
      setStep(1);
      setUseCustomInstallments(false);
      setCustomInstallmentValues([]);
      setErrors({});
    }
  }, [initialData, isOpen]);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.error!;
    }

    const descValidation = validateDescription(formData.description);
    if (!descValidation.valid) {
      newErrors.description = descValidation.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const valueValidation = validateValue(formData.totalValue);
    if (!valueValidation.valid) {
      newErrors.totalValue = valueValidation.error!;
    }

    const installmentValidation = validateInstallmentCount(formData.installmentCount);
    if (!installmentValidation.valid) {
      newErrors.installmentCount = installmentValidation.error!;
    }

    const dateValidation = validateDate(formData.startDate, true);
    if (!dateValidation.valid) {
      newErrors.startDate = dateValidation.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // Calculate installments for preview
      const installments = calculateInstallments(
        formData.totalValue,
        formData.installmentCount,
        formData.startDate,
        useCustomInstallments ? customInstallmentValues : undefined,
        useCustomInstallments ? formData.customDates : undefined
      );
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const handleSubmit = () => {
    const dataToSubmit: TransactionFormData = {
      ...formData,
      customInstallments: useCustomInstallments ? customInstallmentValues : undefined,
    };
    onSubmit(dataToSubmit);
  };

  const calculatedInstallments = calculateInstallments(
    formData.totalValue,
    formData.installmentCount,
    formData.startDate,
    useCustomInstallments ? customInstallmentValues : undefined,
    useCustomInstallments ? formData.customDates : undefined
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Passo 1 de 3: Informações básicas'}
            {step === 2 && 'Passo 2 de 3: Detalhes financeiros'}
            {step === 3 && 'Passo 3 de 3: Revisão e confirmação'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Salário, TV 55 polegadas"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: string) => setFormData({ ...formData, type: value as 'INCOME' | 'EXPENSE' })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais (opcional)"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="totalValue">Valor Total *</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.totalValue || ''}
                  onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                {errors.totalValue && (
                  <p className="text-sm text-destructive">{errors.totalValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="installmentCount">Quantidade de Parcelas *</Label>
                <Input
                  id="installmentCount"
                  type="number"
                  min="1"
                  max="360"
                  value={formData.installmentCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 1;
                    setFormData({ ...formData, installmentCount: count });
                    setUseCustomInstallments(false);
                    setCustomInstallmentValues([]);
                  }}
                />
                {errors.installmentCount && (
                  <p className="text-sm text-destructive">{errors.installmentCount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(formData.startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date: Date | undefined) => date && setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate}</p>
                )}
              </div>

              {formData.installmentCount > 1 && formData.totalValue > 0 && (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      O valor será dividido em {formData.installmentCount} parcelas de{' '}
                      {formatCurrency(formData.totalValue / formData.installmentCount)} a partir de{' '}
                      {formatDate(formData.startDate)}.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="custom-installments"
                      checked={useCustomInstallments}
                      onCheckedChange={setUseCustomInstallments}
                    />
                    <Label htmlFor="custom-installments">
                      Ajustar parcelas individualmente
                    </Label>
                  </div>

                  {useCustomInstallments && (
                    <InstallmentAdjuster
                      installments={calculatedInstallments}
                      totalValue={formData.totalValue}
                      onUpdate={(values, dates) => {
                        setCustomInstallmentValues(values);
                        if (dates) {
                          setFormData(prev => ({ ...prev, customDates: dates }));
                        }
                      }}
                    />
                  )}
                </>
              )}
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Nome:</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span className={formData.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                    {formData.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                {formData.description && (
                  <div className="flex justify-between">
                    <span>Descrição:</span>
                    <span className="text-right max-w-xs">{formData.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Valor Total:</span>
                  <span>{formatCurrency(formData.totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parcelas:</span>
                  <span>{formatInstallment(1, formData.installmentCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data de Início:</span>
                  <span>{formatDate(formData.startDate)}</span>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Detalhamento das Parcelas:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {calculatedInstallments.map((inst, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>
                        Parcela {inst.installmentNumber}/{formData.installmentCount}
                      </span>
                      <div className="text-right">
                        <div>{formatCurrency(inst.value)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(inst.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Voltar
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Próximo</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Confirmar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
