import { Leaf, Snowflake, LayoutDashboard, LucideIcon } from 'lucide-react';

export const getIconBySlug = (slug: string): LucideIcon => {
  const s = slug.toLowerCase();
  
  if (s.includes('holiday') || s.includes('christmas') || s.includes('light')) return Snowflake;
  if (s.includes('hardscape') || s.includes('patio') || s.includes('stone')) return LayoutDashboard;
  
  // Default to Leaf for landscaping/general
  return Leaf;
};