export interface Reminder {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  isNote?: boolean;
}

export interface ListItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
  createdAt: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
}

export interface FinanceEntry {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string;
  recurring?: 'monthly' | 'weekly' | null;
}

export const DEFAULT_CATEGORIES: FinanceCategory[] = [
  { id: 'salary', name: 'Salário', type: 'income' },
  { id: 'freelance', name: 'Freelance', type: 'income' },
  { id: 'investments', name: 'Investimentos', type: 'income' },
  { id: 'other-income', name: 'Outros', type: 'income' },
  { id: 'food', name: 'Alimentação', type: 'expense' },
  { id: 'transport', name: 'Transporte', type: 'expense' },
  { id: 'housing', name: 'Moradia', type: 'expense' },
  { id: 'health', name: 'Saúde', type: 'expense' },
  { id: 'entertainment', name: 'Lazer', type: 'expense' },
  { id: 'education', name: 'Educação', type: 'expense' },
  { id: 'clothing', name: 'Vestuário', type: 'expense' },
  { id: 'other-expense', name: 'Outros', type: 'expense' },
];
