export type ExpenseCategory =
  | 'Food & Beverage'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Other';

export type StructuredExpense = {
  merchant: string | null;
  amount: number | null;
  currency: string | null;
  date: string | null; // ISO 8601 YYYY-MM-DD
  category: ExpenseCategory;
  confidence?: number;
};

export interface ILLMProvider {
  structureExpense(rawText: string): Promise<StructuredExpense>;
}
