export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';

export interface InvoiceDTO {
  id: string;
  jobId: string;       // Link to the Job
  customerId: string;
  amount: number;
  balanceDue: number;  // Remaining amount
  dueDate: string;     // ISO Date
  status: InvoiceStatus;
  pdfUrl?: string;     // For downloading the PDF
  createdAt: string;
}

export interface CreateInvoiceRequest {
  jobId: string;
  customerId: string;
  amount: number;
  dueDate: string;
  lineItems: {
    description: string;
    amount: number;
    quantity: number;
  }[];
}