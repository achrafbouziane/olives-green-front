import { useState } from 'react';
import { apiClient } from './api-client';

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // This calls the Storage Service via the Gateway
      // Ensure your Gateway routes /api/v1/storage/** to storage-service
      const response = await apiClient.post<string>('/api/v1/storage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // The backend returns the full URL (e.g., http://localhost:8085/files/...)
      return response.data; 
    } catch (err: any) {
      console.error('Upload failed', err);
      setUploadError('Failed to upload file. Check connection.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, uploadError };
}