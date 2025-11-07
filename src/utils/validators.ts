export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Nome deve ter no mínimo 3 caracteres' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Nome deve ter no máximo 100 caracteres' };
  }
  return { valid: true };
};

export const validateDescription = (description?: string): { valid: boolean; error?: string } => {
  if (description && description.length > 500) {
    return { valid: false, error: 'Descrição não pode exceder 500 caracteres' };
  }
  return { valid: true };
};

export const validateValue = (value: number): { valid: boolean; error?: string } => {
  if (isNaN(value) || value < 0.01) {
    return { valid: false, error: 'Valor deve ser no mínimo 0.01' };
  }
  if (value > 999999.99) {
    return { valid: false, error: 'Valor deve ser no máximo 999.999,99' };
  }
  return { valid: true };
};

export const validateInstallmentCount = (count: number): { valid: boolean; error?: string } => {
  if (!Number.isInteger(count) || count < 1) {
    return { valid: false, error: 'Número de parcelas deve ser no mínimo 1' };
  }
  if (count > 360) {
    return { valid: false, error: 'Número de parcelas deve ser no máximo 360' };
  }
  return { valid: true };
};

export const validateDate = (date: Date, allowPast: boolean = true): { valid: boolean; error?: string } => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: 'Data inválida' };
  }
  
  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return { valid: false, error: 'Data não pode ser retroativa' };
    }
  }
  
  return { valid: true };
};
