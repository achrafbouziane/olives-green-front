import { useState, useEffect } from 'react';
import { apiClient } from './api-client';
import { ServicePageDTO } from '@olives-green/shared-types';

// Base URL for Content Service
// Final URL becomes: http://localhost:8080/content-service/api/v1/content/pages
const SERVICE_PREFIX = '/content-service/api';

export function useServices() {
  const [services, setServices] = useState<ServicePageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<ServicePageDTO[]>(`${SERVICE_PREFIX}/v1/content/pages`);
        setServices(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch services', err);
        setError('Could not load services from backend.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  return { services, isLoading, error };
}

export function useServiceBySlug(slug: string | undefined) {
  const [service, setService] = useState<ServicePageDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchService = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<ServicePageDTO>(`${SERVICE_PREFIX}/v1/content/pages/${slug}`);
        setService(response.data);
      } catch (err) {
        console.error(`Failed to fetch page: ${slug}`, err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  return { service, isLoading };
}