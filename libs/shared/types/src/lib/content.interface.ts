// Matches your NEW Backend DTOs
export interface ServicePageDTO {
  id: string;
  pageSlug: string;
  title: string;
  subTitle: string;
  imageUrl: string;
  description: string; // Was htmlContent
  features: string[];  // New structured list
}

export interface SavePageRequest {
  pageSlug: string;
  title: string;
  subTitle: string;
  imageUrl: string;
  description: string;
  features: string[];
}