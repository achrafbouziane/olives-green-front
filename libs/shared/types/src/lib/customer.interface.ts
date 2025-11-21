export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string; // Ensure phone is here
}

export interface CustomerDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreatePropertyRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;       // <--- NEW FIELD
  postalCode?: string;
  notes?: string;
  customerId: string;
}

export interface PropertyDTO {
  id: string;
  addressLine1: string;
  city: string;
  state: string;
}