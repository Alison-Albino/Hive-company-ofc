import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Register schema for viewers (free users)
export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  userType: z.literal("viewer"),
});

// Provider registration schema (requires plan subscription)
export const providerRegistrationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  documentType: z.enum(["CPF", "CNPJ"]),
  documentNumber: z.string().min(11, "Documento inválido"),
  speciality: z.string().min(5, "Especialidade deve ser mais detalhada"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  location: z.string().min(5, "Localização inválida"),
  categories: z.array(z.string()).min(1, "Selecione pelo menos uma categoria"),
  phone: z.string().min(10, "Telefone inválido"),
  planType: z.enum(["A", "B"]),
});

// Property creation schema (only for real estate providers)
export const createPropertySchema = z.object({
  title: z.string().min(5, "Título muito curto"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  price: z.string().min(1, "Preço obrigatório"),
  priceType: z.enum(["sale", "rent", "event"]),
  propertyType: z.enum(["apartment", "house", "commercial", "event_hall"]),
  location: z.string().min(5, "Localização inválida"),
  bedrooms: z.number().optional(),
  bathrooms: z.number().min(1, "Pelo menos 1 banheiro"),
  parkingSpaces: z.number().optional(),
  area: z.number().min(1, "Área obrigatória"),
  imageUrl: z.string().url("URL da imagem inválida"),
  images: z.array(z.string().url()).default([]),
  amenities: z.array(z.string()).default([]),
});

// Inferred types
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ProviderRegistrationData = z.infer<typeof providerRegistrationSchema>;
export type CreatePropertyData = z.infer<typeof createPropertySchema>;

// User types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: "viewer" | "provider";
  isActive: boolean;
  categories?: string[];
  subcategories?: string[];
  description?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profileImage?: string;
  profileImageUrl?: string;
  portfolioImages?: string[];
  bio?: string;
  businessHours?: string;
  rating?: string;
  reviewCount?: number;
  isVerified?: boolean;
  planType?: "A" | "B";
  providerPlan?: "A" | "B";
  planStatus?: "inactive" | "pending" | "active";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  completionPercentage?: number;
  documentsVerified?: boolean;
  documentType?: string;
  documentNumber?: string;
  provider?: {
    id: string;
    categories: string[];
    planType: string;
    planActive: boolean;
    verified: boolean;
  };
}

export interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
}