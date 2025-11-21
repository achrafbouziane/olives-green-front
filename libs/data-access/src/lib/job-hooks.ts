import { useState, useEffect } from 'react';
import { apiClient } from './api-client';
import { CreateQuoteRequest, QuoteDTO, QuoteStatus } from '@olives-green/shared-types';
import { CreateCustomerRequest, CustomerDTO, CreatePropertyRequest, PropertyDTO } from '@olives-green/shared-types';
import { JobDTO, ScheduleJobRequest } from '@olives-green/shared-types';
const JOB_SERVICE = '/job-service/api';
const CUSTOMER_SERVICE = '/customer-service/api';

// ... useQuotes & useUpdateQuoteStatus (Keep existing logic) ...
export function useQuotes() {
  const [quotes, setQuotes] = useState<QuoteDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<QuoteDTO[]>(`${JOB_SERVICE}/v1/quotes`);
      setQuotes(response.data);
    } catch (err: any) {
      console.error('Failed to fetch quotes', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchQuotes(); }, []);
  return { quotes, isLoading, error, refetch: fetchQuotes };
}

export function useUpdateQuoteStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const updateStatus = async (id: string, status: QuoteStatus) => {
    setIsLoading(true);
    try {
      if (status === 'APPROVED') await apiClient.post(`${JOB_SERVICE}/v1/quotes/${id}/approve`);
      else if (status === 'REJECTED') await apiClient.post(`${JOB_SERVICE}/v1/quotes/${id}/reject`);
      else await apiClient.put(`${JOB_SERVICE}/v1/quotes/${id}/status`, { status });
      return true;
    } catch (err) { return false; } finally { setIsLoading(false); }
  };
  return { updateStatus, isLoading };
}

// --- NEW HOOKS FOR ADMIN ---
export function useQuoteById(id: string | undefined) {
    const [quote, setQuote] = useState<QuoteDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const fetchQuote = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<QuoteDTO>(`${JOB_SERVICE}/v1/quotes/${id}`);
        setQuote(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => { fetchQuote(); }, [id]);
    return { quote, isLoading, refetch: fetchQuote };
}
  
export function useAdminQuoteActions() {
    const [isProcessing, setIsProcessing] = useState(false);
  
    const updateQuotePrice = async (id: string, data: CreateQuoteRequest) => {
      setIsProcessing(true);
      try {
        // PUT /job-service/api/v1/quotes/{id}
        await apiClient.put(`${JOB_SERVICE}/v1/quotes/${id}`, data);
        return true;
      } catch (err) {
        console.error("Failed to update quote", err);
        return false;
      } finally {
        setIsProcessing(false);
      }
    };
  
    const sendEstimate = async (id: string) => {
      setIsProcessing(true);
      try {
        // POST /job-service/api/v1/quotes/{id}/send
        await apiClient.post(`${JOB_SERVICE}/v1/quotes/${id}/send`);
        return true;
      } catch (err) {
        console.error("Failed to send estimate", err);
        return false;
      } finally {
        setIsProcessing(false);
      }
    };
  
    return { updateQuotePrice, sendEstimate, isProcessing };
}

export function useCreateQuote() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  type PublicQuotePayload = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string; 
    serviceType: string;
    details: string;
    coords?: { lat: number; lng: number } | null;
  };

  const createQuote = async (formData: PublicQuotePayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Customer Logic (Same as before)
      let customerId: string | null = null;
      try {
        const searchRes = await apiClient.get<CustomerDTO>(`${CUSTOMER_SERVICE}/v1/customers/search?email=${formData.email}`);
        if (searchRes.data?.id) customerId = searchRes.data.id;
      } catch (e) {}

      if (!customerId) {
        const nameParts = formData.name.trim().split(' ');
        const customerRes = await apiClient.post<CustomerDTO>(`${CUSTOMER_SERVICE}/v1/customers`, {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || 'Guest',
          email: formData.email,
          phoneNumber: formData.phone
        });
        customerId = customerRes.data.id;
      }

      // 2. Property Logic (Same as before)
      const propertyRes = await apiClient.post<PropertyDTO>(`${CUSTOMER_SERVICE}/v1/customers/properties`, {
        addressLine1: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode || '00000',
        customerId: customerId,
        notes: 'Web Request'
      });

      // 3. Quote Logic (FIXED)
      const coordsString = formData.coords 
        ? `Coordinates: ${formData.coords.lat}, ${formData.coords.lng}` 
        : 'No coordinates provided';

      // We construct a detailed block for the Admin to see on the left sidebar
      const detailedRequest = `Client: ${formData.name} (${formData.email})\nPhone: ${formData.phone}\nLocation: ${formData.address}, ${formData.city}, ${formData.state} ${formData.postalCode}\n${coordsString}\nNotes: ${formData.details}`;

      const quotePayload: CreateQuoteRequest = {
        customerId: customerId,
        propertyId: propertyRes.data.id,
        title: `Web Request: ${formData.serviceType}`,
        requestDetails: detailedRequest, // <--- Save PERMANENTLY here
        lineItems: [] // Empty line items initially! Admin will add them.
      };

      await apiClient.post(`${JOB_SERVICE}/v1/quotes`, quotePayload); 
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Workflow Failed:', err);
      setError(err.response?.data?.message || 'Failed to process request.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => { setIsSuccess(false); setError(null); };
  return { createQuote, isLoading, error, isSuccess, reset };
}