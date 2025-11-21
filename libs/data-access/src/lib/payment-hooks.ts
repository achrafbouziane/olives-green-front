import { useState } from 'react';
import { apiClient } from './api-client';
import { PaymentIntentRequest, PaymentIntentResponse } from '@olives-green/shared-types';

const INVOICE_SERVICE = '/invoice-service/api';

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (data: PaymentIntentRequest): Promise<PaymentIntentResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // POST /invoice-service/api/v1/payments/create-intent
      const response = await apiClient.post<PaymentIntentResponse>(`${INVOICE_SERVICE}/v1/payments/create-intent`, data);
      return response.data;
    } catch (err: any) {
      console.error('Payment Init Failed:', err);
      setError('Could not initialize secure payment.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPaymentIntent, isLoading, error };
}