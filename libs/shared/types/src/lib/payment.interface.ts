export interface PaymentIntentRequest {
  quoteId: string;
  amount: number; // The base deposit amount
  currency: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
  amount: number;      // Total charged (including fees)
  feeAmount: number;   // The calculated fee
}