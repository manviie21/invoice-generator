export interface SenderDetails {
  id?: number;
  name: string;
  address: string;
  pan?: string | null;
  bankAccountName: string;
  bankAccountNumber: string;
  ifsc: string;
  bankName: string;
  upiId?: string | null;
  signatureImageUrl?: string | null;
  updatedAt?: Date | null;
}

export interface ClientCustomField {
  id?: string;
  label: string;
  value: string;
}

export interface Client {
  id: number;
  name: string;
  address: string;
  email?: string | null;
  gstin?: string | null;
  pan?: string | null;
  customFields?: ClientCustomField[] | string | null;
  createdAt?: Date | null;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  qty?: number | string | null;
  rate?: number | string | null;
  amount: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  issueDate: string; // YYYY-MM-DD
  reference?: string | null;
  items: InvoiceItem[];
  total: number;
  amountInWords: string;
  notes?: string | null;
  status: InvoiceStatus;
  createdAt?: Date | null;
  client?: Client;
}
