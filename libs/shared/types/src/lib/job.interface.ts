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
  title: string;
  clientName: string;
  propertyAddress: string;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED';
  
  // READ: The backend only returns the Date (YYYY-MM-DD)
  scheduledDate?: string; 
  
  assignedEmployeeId?: string; 
  visits?: JobVisitDTO[];
}

export interface UpdateJobStatusRequest {
  newStatus: JobDTO['status'];
}

export interface ScheduleJobRequest {
  jobId: string;           // New field required by Backend Record
  assignedEmployeeId: string;
  startTime: string;       // Renamed from startDate
  endTime: string;         // Renamed from endDate
  notes?: string;          // Added optional notes
}

export interface JobVisitDTO {
  id: string;
  jobId: string;
  assignedEmployeeId: string;
  checkInTime: string;       // ISO String
  checkOutTime?: string;     // ISO String (nullable)
  notes?: string;
  tasksCompleted?: string[];
  beforePhotoUrls?: string[];
  afterPhotoUrls?: string[];
}

export interface JobVisitRequest {
  assignedEmployeeId?: string; // Optional if just updating notes
  notes?: string;
  tasks?: string[];
  beforePhotos?: string[];
  afterPhotos?: string[];
  endTime?: string; // ISO String for checkout
}