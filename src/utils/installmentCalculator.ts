import { addMonths } from './formatters';

export interface InstallmentCalculation {
  installmentNumber: number;
  value: number;
  dueDate: Date;
}

export const calculateInstallments = (
  totalValue: number,
  installmentCount: number,
  startDate: Date,
  customValues?: number[]
): InstallmentCalculation[] => {
  const installments: InstallmentCalculation[] = [];

  if (customValues && customValues.length === installmentCount) {
    // Use custom values
    for (let i = 0; i < installmentCount; i++) {
      installments.push({
        installmentNumber: i + 1,
        value: customValues[i],
        dueDate: addMonths(startDate, i),
      });
    }
  } else {
    // Calculate equal installments
    const baseValue = Math.floor((totalValue * 100) / installmentCount) / 100;
    const remainder = Math.round((totalValue - baseValue * installmentCount) * 100) / 100;

    for (let i = 0; i < installmentCount; i++) {
      const isLast = i === installmentCount - 1;
      const value = isLast ? baseValue + remainder : baseValue;

      installments.push({
        installmentNumber: i + 1,
        value: Number(value.toFixed(2)),
        dueDate: addMonths(startDate, i),
      });
    }
  }

  return installments;
};

export const validateCustomInstallments = (
  customValues: number[],
  totalValue: number
): { valid: boolean; sum: number; difference: number } => {
  const sum = customValues.reduce((acc, val) => acc + val, 0);
  const difference = Math.round((sum - totalValue) * 100) / 100;

  return {
    valid: Math.abs(difference) < 0.01,
    sum: Number(sum.toFixed(2)),
    difference: Number(difference.toFixed(2)),
  };
};

export const distributeRemainder = (
  totalValue: number,
  installmentCount: number,
  firstInstallmentValue?: number
): number[] => {
  const installments: number[] = [];

  if (firstInstallmentValue !== undefined && installmentCount > 1) {
    // First installment is custom (e.g., down payment)
    installments.push(firstInstallmentValue);
    const remaining = totalValue - firstInstallmentValue;
    const remainingCount = installmentCount - 1;
    const baseValue = Math.floor((remaining * 100) / remainingCount) / 100;
    const remainder = Math.round((remaining - baseValue * remainingCount) * 100) / 100;

    for (let i = 0; i < remainingCount; i++) {
      const isLast = i === remainingCount - 1;
      installments.push(Number((isLast ? baseValue + remainder : baseValue).toFixed(2)));
    }
  } else {
    // Equal distribution
    const baseValue = Math.floor((totalValue * 100) / installmentCount) / 100;
    const remainder = Math.round((totalValue - baseValue * installmentCount) * 100) / 100;

    for (let i = 0; i < installmentCount; i++) {
      const isLast = i === installmentCount - 1;
      installments.push(Number((isLast ? baseValue + remainder : baseValue).toFixed(2)));
    }
  }

  return installments;
};
