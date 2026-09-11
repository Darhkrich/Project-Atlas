export interface EcommerceTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  componentName: string;
  allowedPlans: string[];
  isActive: boolean;
  usageCount: number;
}