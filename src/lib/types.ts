
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  pdfFileName: string;
  pdfDataUri?: string;
  vendor: string;
  invoiceNumber: string;
  invoiceDate: string; // Storing as string for simplicity
  lineItems: LineItem[];
  totalAmount: number;
  createdAt: string; // ISO date string
}
