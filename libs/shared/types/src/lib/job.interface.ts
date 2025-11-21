// ... Enums ...
export type JobStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED';

export type QuoteStatus = 
  | 'REQUESTED' 
  | 'ESTIMATE_SENT' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'DEPOSIT_PAID';

// ... DTOs ...

export interface LineItemDTO {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface QuoteDTO {
  id: string;
  customerId: string;
  propertyId: string;
  title: string;
  status: QuoteStatus;
  totalAmount: number;
  depositAmount?: number;
  magicLinkToken?: string;
  
  // NEW FIELD: Stores the raw initial request (Coords, Address) permanently
  requestDetails?: string; 
  
  createdAt: string;
  lineItems: LineItemDTO[];
  mockupImageUrls?: string[]; // New Field

}

export interface CreateLineItemRequest {
  description: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateQuoteRequest {
  customerId: string;
  propertyId: string;
  title: string;
  
  // NEW FIELD in Request
  requestDetails: string; 
  
  lineItems: CreateLineItemRequest[];
  mockupImageUrls?: string[]; // New Field

}


export interface JobDTO {
  id: string;
  quoteId: string;
  // We embed essential info to avoid extra fetches, or assume the backend provides it
  title: string; // e.g., "Web Request: Christmas Lights"
  clientName: string;
  propertyAddress: string;
  
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED';
  
  // Scheduling Info
  scheduledStartDate?: string; // ISO Date
  scheduledEndDate?: string;   // ISO Date
  assignedTeamId?: string;
}

export interface UpdateJobStatusRequest {
  status: JobDTO['status'];
}

export interface ScheduleJobRequest {
  startDate: string;
  endDate: string;
  assignedTeamId?: string;
}