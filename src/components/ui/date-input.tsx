import { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';

interface DateInputProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  min?: Date;
  max?: Date;
  className?: string;
  id?: string;
}

export function DateInput({ value, onChange, label, min, max, className, id }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Formatar a data para exibição brasileira (DD/MM/YYYY)
    const formatted = formatDateForDisplay(value);
    setDisplayValue(formatted);
  }, [value]);

  const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseBrazilianDate = (dateStr: string): Date | null => {
    // Aceitar formato DD/MM/YYYY ou DD-MM-YYYY
    const cleaned = dateStr.replace(/-/g, '/');
    const parts = cleaned.split('/');
    
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexed
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 0 || month > 11) return null;
    if (year < 1900 || year > 2100) return null;
    
    const date = new Date(year, month, day);
    
    // Verificar se a data é válida
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null;
    }
    
    return date;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Permitir apenas números e barras
    inputValue = inputValue.replace(/[^0-9/]/g, '');
    
    // Auto-formatar enquanto digita
    if (inputValue.length <= 10) {
      // Adicionar barras automaticamente
      if (inputValue.length === 2 && !inputValue.includes('/')) {
        inputValue += '/';
      } else if (inputValue.length === 5 && inputValue.split('/').length === 2) {
        inputValue += '/';
      }
      
      setDisplayValue(inputValue);
      
      // Se tiver uma data completa válida, atualizar
      if (inputValue.length === 10) {
        const parsedDate = parseBrazilianDate(inputValue);
        if (parsedDate) {
          // Verificar limites
          if (min && parsedDate < min) return;
          if (max && parsedDate > max) return;
          
          onChange(parsedDate);
        }
      }
    }
  };

  const handleBlur = () => {
    // Se o valor não estiver completo ou for inválido, voltar para a data original
    if (displayValue.length !== 10 || !parseBrazilianDate(displayValue)) {
      setDisplayValue(formatDateForDisplay(value));
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="DD/MM/AAAA"
        maxLength={10}
        className={className}
      />
    </div>
  );
}