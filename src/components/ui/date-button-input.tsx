import { useState } from 'react';
import { Button } from './button';
import { CalendarIcon } from 'lucide-react';
import { cn } from './utils';

interface DateButtonInputProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  min?: Date;
  max?: Date;
  className?: string;
  id?: string;
}

export function DateButtonInput({ value, onChange, label, min, max, className, id }: DateButtonInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Corrigir fuso horário: criar data no fuso local
    const [year, month, day] = e.target.value.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0); // Meio-dia para evitar problemas de fuso
    if (date && !isNaN(date.getTime())) {
      onChange(date);
      setShowPicker(false);
    }
  };

  // Formatar data no padrão brasileiro
  const formatDateBr = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formatar data para o input HTML (YYYY-MM-DD) no fuso local
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleButtonClick = () => {
    setShowPicker(true);
  };

  return (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left", className)}
          type="button"
          onClick={handleButtonClick}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateBr(value)}
        </Button>
        
        {showPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 z-50">
            <input
               id={id}
               type="date"
               value={formatDateForInput(value)}
               onChange={handleDateChange}
               min={min ? formatDateForInput(min) : undefined}
               max={max ? formatDateForInput(max) : undefined}
               className="border rounded p-2"
               autoFocus
               onBlur={() => setShowPicker(false)}
             />
          </div>
        )}
      </div>
    </div>
  );
}