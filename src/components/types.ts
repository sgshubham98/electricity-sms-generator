export type ViewMode = 'table' | 'card';
export type FilterType = 'state' | 'board';
export type NameFormat = 'full_name' | 'full_name_with_abbrv' | 'none';

export type BillerItem = {
  "Biller Name"?: string;
  State?: string;
  Billers?: string;
};

export type StateCount = {
  state: string;
  num: number;
};

export type GeneratedRow = {
  id: number;
  senderId: string;
  board: string;
  state: string;
  category: string;
  consumerNo: string;
  amount: number;
  billDate: string;
  dueDate: string;
  sms: string;
};
