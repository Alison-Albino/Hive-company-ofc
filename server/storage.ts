import { type Property, type InsertProperty, type ServiceProvider, type InsertServiceProvider, type ServiceCategory, type InsertServiceCategory, type Plan, type InsertPlan } from "@shared/schema";
import type { AuthUser, LoginData, RegisterData, ProviderRegistrationData, CreatePropertyData } from "@shared/auth-schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  incrementPropertyViews(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  // Service Providers
  getServiceProviders(): Promise<ServiceProvider[]>;
  getServiceProvidersByCategory(category: string): Promise<ServiceProvider[]>;
  getServiceProvider(id: string): Promise<ServiceProvider | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  
  // Service Categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategory(slug: string): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  
  // Plans
  getPlans(): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;

  // Authentication operations
  login(data: LoginData): Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  register(data: RegisterData): Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  registerProvider(data: ProviderRegistrationData): Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  
  // User operations
  getUser(id: string): Promise<AuthUser | undefined>;
  getUserByEmail(email: string): Promise<AuthUser | undefined>;
  
  // Property operations for providers
  createPropertyAsProvider(userId: string, property: CreatePropertyData): Promise<Property | null>;
  canCreateProperty(userId: string): Promise<boolean>;

  // User profile operations (legacy, keeping for compatibility)
  getUserProfiles(params?: { documentType?: string; city?: string }): Promise<any[]>;
  getUserProfile(id: string): Promise<any>;
  createUserProfile(profile: any): Promise<any>;
  updateUserProfile(id: string, profile: any): Promise<any>;
  upsertUser(user: any): Promise<any>;
}

// Simple in-memory user interface for authentication
interface SimpleUser {
  id: string;
  email: string;
  password: string;
  name: string;
  userType: "viewer" | "provider";
  isActive: boolean;
  providerId?: string;
}

export class MemStorage implements IStorage {
  private properties: Map<string, Property>;
  private serviceProviders: Map<string, ServiceProvider>;
  private serviceCategories: Map<string, ServiceCategory>;
  private plans: Map<string, Plan>;
  private users: Map<string, SimpleUser>;
  private sampleProfiles: any[];
  private sampleUsers: any[];

  constructor() {
    this.properties = new Map();
    this.serviceProviders = new Map();
    this.serviceCategories = new Map();
    this.plans = new Map();
    this.users = new Map();
    this.sampleProfiles = [];
    this.sampleUsers = [];
    this.seedData();
  }

  private seedData() {
    // Seed Properties
    const sampleProperties: Property[] = [
      {
        id: randomUUID(),
        title: "Apartamento Luxury Vista Mar",
        description: "Apartamento moderno com vista para o mar, totalmente mobiliado com acabamentos de luxo.",
        price: "850000.00",
        priceType: "sale",
        propertyType: "apartment",
        location: "Copacabana, Rio de Janeiro",
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 2,
        area: 120,
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [],
        amenities: ["Piscina", "Academia", "Varanda", "Ar condicionado"],
        agencyName: "Imobiliária Premium RJ",
        agencyId: "agency-premium-rj",
        agencyPhone: "(21) 3333-4444",
        agencyEmail: "contato@premiumrj.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        status: "available",
        featured: true,
        views: 0,
      },
      {
        id: randomUUID(),
        title: "Casa Condomínio Fechado",
        description: "Casa espaçosa em condomínio fechado com área de lazer completa.",
        price: "3500.00",
        priceType: "rent",
        propertyType: "house",
        location: "Barra da Tijuca, Rio de Janeiro",
        bedrooms: 4,
        bathrooms: 3,
        parkingSpaces: 4,
        area: 200,
        imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [],
        amenities: ["Jardim", "Churrasqueira", "Piscina", "Segurança 24h"],
        agencyName: "Barra Imóveis Ltda",
        agencyId: "agency-barra-ltda",
        agencyPhone: "(21) 2222-3333",
        agencyEmail: "vendas@barraimoveis.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
        status: "available",
        featured: true,
        views: 0,
      },
      {
        id: randomUUID(),
        title: "Salão de Festas Premium",
        description: "Salão elegante para eventos com capacidade para 200 pessoas.",
        price: "1200.00",
        priceType: "event",
        propertyType: "event_hall",
        location: "Ipanema, Rio de Janeiro",
        bedrooms: null,
        bathrooms: 4,
        parkingSpaces: 50,
        area: 300,
        imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [],
        amenities: ["Cozinha", "Som profissional", "Iluminação", "Decoração"],
        agencyName: "Eventos & Celebrações",
        agencyId: "agency-eventos-celebracoes",
        agencyPhone: "(21) 1111-2222",
        agencyEmail: "eventos@celebracoes.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
        status: "available",
        featured: true,
        views: 0,
      },
      {
        id: randomUUID(),
        title: "Sala Comercial Centro",
        description: "Sala comercial moderna no centro da cidade com excelente localização.",
        price: "2800.00",
        priceType: "rent",
        propertyType: "commercial",
        location: "Centro, Rio de Janeiro",
        bedrooms: null,
        bathrooms: 2,
        parkingSpaces: 2,
        area: 120,
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        images: [],
        amenities: ["Fibra óptica", "Ar condicionado", "Elevador", "Segurança"],
        agencyName: "Centro Business Imóveis",
        agencyId: "agency-centro-business",
        agencyPhone: "(21) 3000-1000",
        agencyEmail: "comercial@centrobusiness.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1497366411874-c6010221eadc?w=400&h=400&fit=crop",
        status: "available",
        featured: true,
        views: 0,
      },
      // Mais propriedades da Imobiliária Premium RJ
      {
        id: randomUUID(),
        title: "Cobertura Duplex Vista Lagoa",
        description: "Cobertura luxuosa com terraço privativo e vista deslumbrante para a Lagoa Rodrigo de Freitas. Acabamentos importados.",
        price: "2200000.00",
        priceType: "sale",
        propertyType: "apartment",
        location: "Lagoa, Rio de Janeiro",
        bedrooms: 4,
        bathrooms: 4,
        parkingSpaces: 3,
        area: 280,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop"
        ],
        amenities: ["Terraço privativo", "Vista lagoa", "Suíte master", "Home office", "Lareira"],
        agencyName: "Imobiliária Premium RJ",
        agencyId: "agency-premium-rj",
        agencyPhone: "(21) 3333-4444",
        agencyEmail: "contato@premiumrj.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        status: "available",
        featured: true,
        views: 0,
      },
      {
        id: randomUUID(),
        title: "Apartamento Frente Mar Leblon",
        description: "Apartamento de luxo com vista frontal para o mar do Leblon. Completamente reformado e mobiliado.",
        price: "8500.00",
        priceType: "rent",
        propertyType: "apartment",
        location: "Leblon, Rio de Janeiro",
        bedrooms: 2,
        bathrooms: 2,
        parkingSpaces: 1,
        area: 95,
        imageUrl: "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
        ],
        amenities: ["Vista mar", "Mobiliado", "Varanda", "Portaria 24h"],
        agencyName: "Imobiliária Premium RJ",
        agencyId: "agency-premium-rj",
        agencyPhone: "(21) 3333-4444",
        agencyEmail: "contato@premiumrj.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        status: "available",
        featured: false,
        views: 0,
      },
      // Propriedades da Barra Imóveis Ltda
      {
        id: randomUUID(),
        title: "Casa Condomínio Alpha Barra",
        description: "Casa moderna em condomínio de luxo com área de lazer completa e segurança 24 horas.",
        price: "1200000.00",
        priceType: "sale",
        propertyType: "house",
        location: "Recreio dos Bandeirantes, Rio de Janeiro",
        bedrooms: 5,
        bathrooms: 4,
        parkingSpaces: 4,
        area: 350,
        imageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"
        ],
        amenities: ["Piscina privativa", "Quintal amplo", "Churrasqueira", "Condomínio fechado"],
        agencyName: "Barra Imóveis Ltda",
        agencyId: "agency-barra-ltda",
        agencyPhone: "(21) 2222-3333",
        agencyEmail: "vendas@barraimoveis.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
        status: "available",
        featured: true,
        views: 0,
      },
      {
        id: randomUUID(),
        title: "Apartamento 3 Quartos Downtown",
        description: "Apartamento moderno próximo ao shopping com excelente infraestrutura e lazer.",
        price: "4500.00",
        priceType: "rent",
        propertyType: "apartment",
        location: "Downtown, Rio de Janeiro",
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 2,
        area: 85,
        imageUrl: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop"
        ],
        amenities: ["Academia", "Playground", "Salão de festas", "Piscina"],
        agencyName: "Barra Imóveis Ltda",
        agencyId: "agency-barra-ltda",
        agencyPhone: "(21) 2222-3333",
        agencyEmail: "vendas@barraimoveis.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
        status: "available",
        featured: false,
        views: 0,
      },
      // Propriedades da Eventos & Celebrações
      {
        id: randomUUID(),
        title: "Salão Premium Vista Cristo",
        description: "Salão elegante com vista panorâmica do Cristo Redentor. Ideal para casamentos e eventos corporativos.",
        price: "2500.00",
        priceType: "event",
        propertyType: "event_hall",
        location: "Santa Teresa, Rio de Janeiro",
        bedrooms: null,
        bathrooms: 6,
        parkingSpaces: 80,
        area: 500,
        imageUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop"
        ],
        amenities: ["Vista Cristo", "Catering completo", "Som e luz", "Decoração inclusa"],
        agencyName: "Eventos & Celebrações",
        agencyId: "agency-eventos-celebracoes",
        agencyPhone: "(21) 1111-2222",
        agencyEmail: "eventos@celebracoes.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
        status: "available",
        featured: true,
        views: 0,
      },
      // Propriedades da Centro Business Imóveis
      {
        id: randomUUID(),
        title: "Sala Comercial Corporate Tower",
        description: "Sala comercial moderna em prédio corporativo com infraestrutura completa no coração financeiro da cidade.",
        price: "4200.00",
        priceType: "rent",
        propertyType: "commercial",
        location: "Centro, Rio de Janeiro",
        bedrooms: null,
        bathrooms: 1,
        parkingSpaces: 2,
        area: 65,
        imageUrl: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop"
        ],
        amenities: ["Recepção", "Internet fibra", "Ar central", "Estacionamento"],
        agencyName: "Centro Business Imóveis",
        agencyId: "agency-centro-business",
        agencyPhone: "(21) 3000-1000",
        agencyEmail: "comercial@centrobusiness.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1497366411874-c6010221eadc?w=400&h=400&fit=crop",
        status: "available",
        featured: false,
        views: 0,
      },
      // Propriedades da Zona Norte Homes
      {
        id: randomUUID(),
        title: "Casa Familiar Tijuca",
        description: "Casa tradicional com quintal amplo, ideal para famílias. Localizada em rua tranquila próxima ao metrô.",
        price: "650000.00",
        priceType: "sale",
        propertyType: "house",
        location: "Tijuca, Rio de Janeiro",
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 1,
        area: 120,
        imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
        ],
        amenities: ["Quintal", "Próximo metrô", "Garagem", "Área de serviço"],
        agencyName: "Zona Norte Homes",
        agencyId: "agency-zona-norte-homes",
        agencyPhone: "(21) 4444-5555",
        agencyEmail: "contato@zonanortehomes.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=400&fit=crop",
        status: "available",
        featured: false,
        views: 0,
      },
      {
        id: randomUUID(),
        title: "Apartamento 2 Quartos Vila Isabel",
        description: "Apartamento aconchegante em prédio residencial com portaria. Ótima localização na Vila Isabel.",
        price: "2800.00",
        priceType: "rent",
        propertyType: "apartment",
        location: "Vila Isabel, Rio de Janeiro",
        bedrooms: 2,
        bathrooms: 1,
        parkingSpaces: 1,
        area: 70,
        imageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop",
        images: [],
        amenities: ["Portaria", "Elevador", "Área de serviço", "Sol da manhã"],
        agencyName: "Zona Norte Homes",
        agencyId: "agency-zona-norte-homes",
        agencyPhone: "(21) 4444-5555",
        agencyEmail: "contato@zonanortehomes.com.br",
        agencyLogo: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=400&fit=crop",
        status: "available",
        featured: false,
        views: 0,
      }
    ];

    sampleProperties.forEach(property => {
      this.properties.set(property.id, property);
    });

    // Seed Service Categories
    const categories: ServiceCategory[] = [
      { id: randomUUID(), name: "Encanador", icon: "fas fa-wrench", slug: "plumber", providerCount: 156 },
      { id: randomUUID(), name: "Eletricista", icon: "fas fa-bolt", slug: "electrician", providerCount: 89 },
      { id: randomUUID(), name: "Pintor", icon: "fas fa-paint-roller", slug: "painter", providerCount: 203 },
      { id: randomUUID(), name: "Gesseiro", icon: "fas fa-hammer", slug: "plasterer", providerCount: 67 },
      { id: randomUUID(), name: "Fotógrafo", icon: "fas fa-camera", slug: "photographer", providerCount: 42 },
      { id: randomUUID(), name: "Decorador", icon: "fas fa-paint-brush", slug: "decorator", providerCount: 38 },
      { id: randomUUID(), name: "Limpeza", icon: "fas fa-broom", slug: "cleaning", providerCount: 124 },
      { id: randomUUID(), name: "Segurança", icon: "fas fa-shield-alt", slug: "security", providerCount: 73 },
      { id: randomUUID(), name: "Jardinagem", icon: "fas fa-seedling", slug: "gardening", providerCount: 95 },
      { id: randomUUID(), name: "Reforma", icon: "fas fa-tools", slug: "renovation", providerCount: 167 },
      { id: randomUUID(), name: "Arquitetura", icon: "fas fa-drafting-compass", slug: "architecture", providerCount: 29 },
      { id: randomUUID(), name: "Mudanças", icon: "fas fa-truck", slug: "moving", providerCount: 81 },
      { id: randomUUID(), name: "Imobiliária", icon: "fas fa-building", slug: "imobiliaria", providerCount: 5 }
    ];

    categories.forEach(category => {
      this.serviceCategories.set(category.id, category);
    });

    // Seed Service Providers
    const providers: ServiceProvider[] = [
      {
        id: randomUUID(),
        name: "Carlos Silva",
        speciality: "Eletricista Residencial",
        description: "Especialista em instalações elétricas residenciais com mais de 10 anos de experiência.",
        documentType: "CPF",
        location: "Copacabana, Rio de Janeiro",
        rating: "5.0",
        reviewCount: 127,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        portfolioImages: [
          "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
          "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
          "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"
        ],
        categories: ["electrician"],
        phone: "(21) 99999-9999",
        email: "carlos.silva@email.com",
        planType: "A",
        verified: true,
      },
      {
        id: randomUUID(),
        name: "Limpeza Premium",
        speciality: "Limpeza Residencial e Comercial",
        description: "Empresa especializada em limpeza profissional com equipe treinada e produtos de qualidade.",
        documentType: "CNPJ",
        location: "Barra da Tijuca, Rio de Janeiro",
        rating: "4.9",
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        portfolioImages: [
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
          "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"
        ],
        categories: ["cleaning"],
        phone: "(21) 99888-8888",
        email: "contato@limpezapremium.com",
        planType: "B",
        verified: true,
      },
      {
        id: randomUUID(),
        name: "João Tintas",
        speciality: "Pintura Residencial e Comercial",
        description: "Pintor profissional com experiência em diversos tipos de acabamento e técnicas.",
        documentType: "CPF",
        location: "Ipanema, Rio de Janeiro",
        rating: "4.7",
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        portfolioImages: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
          "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
          "https://images.unsplash.com/photo-1497366412874-3415097a27e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"
        ],
        categories: ["painter"],
        phone: "(21) 99777-7777",
        email: "joao.tintas@email.com",
        planType: "A",
        verified: true,
      },
      // Imobiliárias como prestadores de serviços
      {
        id: "agency-premium-rj",
        name: "Imobiliária Premium RJ",
        speciality: "Imóveis de Luxo na Zona Sul",
        description: "Especializada em imóveis de alto padrão em Copacabana, Ipanema e Leblon. Mais de 15 anos no mercado imobiliário.",
        documentType: "CNPJ",
        location: "Copacabana, Rio de Janeiro",
        rating: "4.9",
        reviewCount: 234,
        imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        portfolioImages: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
        ],
        categories: ["imobiliaria"],
        phone: "(21) 3333-4444",
        email: "contato@premiumrj.com.br",
        planType: "B",
        verified: true,
      },
      {
        id: "agency-barra-ltda",
        name: "Barra Imóveis Ltda",
        speciality: "Residencial e Comercial na Barra",
        description: "Imobiliária tradicional da Barra da Tijuca com foco em residências familiares e empreendimentos comerciais.",
        documentType: "CNPJ", 
        location: "Barra da Tijuca, Rio de Janeiro",
        rating: "4.7",
        reviewCount: 189,
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
        portfolioImages: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"
        ],
        categories: ["imobiliaria"],
        phone: "(21) 2222-3333",
        email: "vendas@barraimoveis.com.br",
        planType: "B",
        verified: true,
      },
      {
        id: "agency-eventos-celebracoes",
        name: "Eventos & Celebrações",
        speciality: "Espaços para Eventos e Festas",
        description: "Especializada em locação de salões de festa, espaços para casamentos e eventos corporativos em toda a cidade.",
        documentType: "CNPJ",
        location: "Ipanema, Rio de Janeiro", 
        rating: "4.8",
        reviewCount: 156,
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
        portfolioImages: [
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop"
        ],
        categories: ["imobiliaria"],
        phone: "(21) 1111-2222", 
        email: "eventos@celebracoes.com.br",
        planType: "B",
        verified: true,
      },
      {
        id: "agency-centro-business",
        name: "Centro Business Imóveis",
        speciality: "Escritórios e Salas Comerciais",
        description: "Foco exclusivo em imóveis comerciais no centro da cidade. Parceira de grandes empresas e startups.",
        documentType: "CNPJ",
        location: "Centro, Rio de Janeiro",
        rating: "4.6", 
        reviewCount: 98,
        imageUrl: "https://images.unsplash.com/photo-1497366411874-c6010221eadc?w=400&h=400&fit=crop",
        portfolioImages: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&h=600&fit=crop"
        ],
        categories: ["imobiliaria"],
        phone: "(21) 3000-1000",
        email: "comercial@centrobusiness.com.br", 
        planType: "B",
        verified: true,
      },
      {
        id: "agency-zona-norte-homes",
        name: "Zona Norte Homes",
        speciality: "Residenciais Zona Norte e Tijuca",
        description: "Imobiliária especializada em residências familiares na Zona Norte, Tijuca e adjacências. Preços acessíveis.",
        documentType: "CNPJ",
        location: "Tijuca, Rio de Janeiro",
        rating: "4.5",
        reviewCount: 167,
        imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=400&fit=crop",
        portfolioImages: [
          "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
        ],
        categories: ["imobiliaria"],
        phone: "(21) 4444-5555",
        email: "contato@zonanortehomes.com.br",
        planType: "B", 
        verified: true,
      }
    ];

    providers.forEach(provider => {
      this.serviceProviders.set(provider.id, provider);
    });

    // Seed Plans
    const plans: Plan[] = [
      {
        id: randomUUID(),
        name: "Plano A - Autônomos",
        type: "A",
        price: "49.00",
        features: [
          "Perfil profissional completo",
          "Galeria de trabalhos (até 20 fotos)",
          "Sistema de avaliações",
          "Contato direto com clientes",
          "Aparição em buscas",
          "Todas as categorias de serviço",
          "Suporte via WhatsApp"
        ],
        targetAudience: "CPF",
        popular: false,
      },
      {
        id: randomUUID(),
        name: "Plano B - Empresas",
        type: "B",
        price: "149.00",
        features: [
          "Tudo do Plano A, mais:",
          "Perfil de empresa completo",
          "Listagem ilimitada de imóveis",
          "Destaque em buscas",
          "Equipe de profissionais",
          "Galeria ilimitada de fotos",
          "Relatórios e analytics",
          "Suporte prioritário"
        ],
        targetAudience: "CNPJ",
        popular: true,
      }
    ];

    plans.forEach(plan => {
      this.plans.set(plan.id, plan);
    });

    // Seed Sample Profiles
    const sampleProfilesData = [
      {
        id: 'cfe135d3-a1bc-451e-87ac-45ab1c584f25',
        documentType: 'CPF',
        displayName: 'João Silva',
        bio: 'Especialista em reparos domésticos e instalações elétricas. Mais de 10 anos de experiência no mercado.',
        profession: 'Eletricista',
        city: 'São Paulo',
        state: 'SP',
        specialties: ['Instalação Elétrica', 'Reparos', 'Manutenção'],
        services: ['Instalação', 'Reparo', 'Manutenção preventiva'],
        profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
        rating: '4.8',
        reviewCount: 156,
        completedJobs: 89,
        responseTime: 15,
        verified: true,
        available: true,
        planType: 'A',
        phone: '(11) 98765-4321',
        socialLinks: {
          whatsapp: '5511987654321',
          instagram: 'https://instagram.com/joaoeletricista'
        },
        portfolioImages: []
      },
      {
        id: 'd8d5b78d-493b-411b-8eb6-c6d943215874',
        documentType: 'CNPJ',
        displayName: 'Construtora Alfa Ltda',
        bio: 'Empresa especializada em construção civil e reformas residenciais e comerciais.',
        companyName: 'Construtora Alfa Ltda',
        tradeName: 'Alfa Construções',
        profession: 'Construção Civil',
        city: 'Rio de Janeiro',
        state: 'RJ',
        foundedYear: 2010,
        employeeCount: 25,
        companyDescription: 'Somos uma empresa consolidada no mercado de construção civil, oferecendo serviços completos de construção e reforma.',
        specialties: ['Construção', 'Reforma', 'Acabamentos'],
        services: ['Obra completa', 'Reforma', 'Acabamentos finos'],
        profileImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop',
        rating: '4.9',
        reviewCount: 234,
        completedJobs: 145,
        responseTime: 30,
        verified: true,
        available: true,
        planType: 'B',
        phone: '(21) 3456-7890',
        website: 'https://alfaconstrucoes.com.br',
        socialLinks: {
          website: 'https://alfaconstrucoes.com.br',
          instagram: 'https://instagram.com/alfaconstrucoes',
          linkedin: 'https://linkedin.com/company/alfa-construcoes'
        },
        portfolioImages: [
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
        ]
      },
      {
        id: randomUUID(),
        documentType: 'CPF',
        displayName: 'Maria Santos',
        bio: 'Paisagista experiente, especializada em jardins residenciais e comerciais com foco em sustentabilidade.',
        profession: 'Paisagista',
        city: 'Belo Horizonte',
        state: 'MG',
        specialties: ['Jardins', 'Paisagismo', 'Plantas nativas'],
        services: ['Projeto de jardim', 'Manutenção', 'Consultoria'],
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b632?w=400&h=400&fit=crop&crop=face',
        rating: '4.7',
        reviewCount: 89,
        completedJobs: 67,
        responseTime: 20,
        verified: true,
        available: false,
        planType: 'A',
        phone: '(31) 99876-5432',
        socialLinks: {
          instagram: 'https://instagram.com/mariapaisagista',
          facebook: 'https://facebook.com/mariasantospaisagismo'
        },
        portfolioImages: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop'
        ]
      },
      {
        id: 'a275f77f-969e-450a-b9ef-d0594b4f0603',
        documentType: 'CPF',
        displayName: 'Carlos Mendes',
        bio: 'Encanador com mais de 15 anos de experiência em instalações hidráulicas e reparos de emergência.',
        profession: 'Encanador',
        city: 'Brasília',
        state: 'DF',
        specialties: ['Instalação hidráulica', 'Vazamentos', 'Desentupimento'],
        services: ['Reparo urgente', 'Instalação', 'Manutenção preventiva'],
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        rating: '4.9',
        reviewCount: 312,
        completedJobs: 278,
        responseTime: 5,
        verified: true,
        available: true,
        planType: 'A',
        phone: '(61) 99999-8888',
        socialLinks: {
          whatsapp: '556199999888'
        },
        portfolioImages: []
      },
      {
        id: '61cfe2ef-bb3b-4960-bb1d-111492d7d997',
        documentType: 'CPF',
        displayName: 'Ana Costa',
        bio: 'Pintora especializada em pintura residencial e decorativa. Trabalho com tintas ecológicas e técnicas modernas.',
        profession: 'Pintor',
        city: 'Salvador',
        state: 'BA',
        specialties: ['Pintura residencial', 'Pintura decorativa', 'Textura'],
        services: ['Pintura interna', 'Pintura externa', 'Decoração'],
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        rating: '4.6',
        reviewCount: 98,
        completedJobs: 76,
        responseTime: 25,
        verified: true,
        available: true,
        planType: 'A',
        phone: '(71) 98888-7777',
        socialLinks: {
          whatsapp: '5571988887777',
          instagram: 'https://instagram.com/anapintora'
        },
        portfolioImages: [
          'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop'
        ]
      },
      {
        id: 'f8d5b78d-493b-411b-8eb6-c6d943215875',
        documentType: 'CPF',
        displayName: 'Roberto Silva',
        bio: 'Técnico em ar condicionado e refrigeração com certificações internacionais.',
        profession: 'Ar Condicionado',
        city: 'Recife',
        state: 'PE',
        specialties: ['Instalação', 'Manutenção', 'Split', 'Central'],
        services: ['Instalação de split', 'Limpeza', 'Reparo'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        rating: '4.8',
        reviewCount: 187,
        completedJobs: 143,
        responseTime: 30,
        verified: true,
        available: true,
        planType: 'A',
        phone: '(81) 97777-6666',
        socialLinks: {
          whatsapp: '558197776666'
        },
        portfolioImages: []
      },
      {
        id: 'g9e5c78f-594c-512c-9fc7-d7e954326876',
        documentType: 'CNPJ',
        displayName: 'TechFix Assistência Técnica',
        bio: 'Empresa especializada em assistência técnica de eletrodomésticos e eletrônicos.',
        companyName: 'TechFix Assistência Técnica Ltda',
        tradeName: 'TechFix',
        profession: 'Assistência Técnica',
        city: 'Fortaleza',
        state: 'CE',
        foundedYear: 2015,
        employeeCount: 8,
        companyDescription: 'Especialistas em reparo de eletrodomésticos, celulares e equipamentos eletrônicos.',
        specialties: ['Eletrodomésticos', 'Celulares', 'Eletrônicos'],
        services: ['Reparo', 'Manutenção', 'Substituição de peças'],
        profileImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
        rating: '4.7',
        reviewCount: 256,
        completedJobs: 189,
        responseTime: 15,
        verified: true,
        available: true,
        planType: 'B',
        phone: '(85) 3333-4444',
        website: 'https://techfix.com.br',
        socialLinks: {
          website: 'https://techfix.com.br',
          instagram: 'https://instagram.com/techfixce'
        },
        portfolioImages: [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'
        ]
      },
      {
        id: 'h0f6d89g-605d-623d-0gd8-e8f065437987',
        documentType: 'CPF',
        displayName: 'Lucas Ferreira',
        bio: 'Marceneiro artesanal especializado em móveis planejados e restauração de antiguidades.',
        profession: 'Marceneiro',
        city: 'Curitiba',
        state: 'PR',
        specialties: ['Móveis planejados', 'Restauração', 'Madeira maciça'],
        services: ['Móveis sob medida', 'Restauração', 'Reparos'],
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        rating: '4.9',
        reviewCount: 67,
        completedJobs: 45,
        responseTime: 60,
        verified: true,
        available: false,
        planType: 'A',
        phone: '(41) 96666-5555',
        socialLinks: {
          whatsapp: '554196665555',
          instagram: 'https://instagram.com/lucasmarceneiro'
        },
        portfolioImages: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'
        ]
      },
      {
        id: 'i1g7e90h-716e-734e-1he9-f9g176548098',
        documentType: 'CPF',
        displayName: 'Fernanda Oliveira',
        bio: 'Diarista e faxineira profissional com experiência em limpeza residencial e comercial.',
        profession: 'Limpeza',
        city: 'Porto Alegre',
        state: 'RS',
        specialties: ['Limpeza residencial', 'Limpeza pós-obra', 'Organização'],
        services: ['Faxina completa', 'Limpeza semanal', 'Limpeza pós-mudança'],
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b632?w=400&h=400&fit=crop&crop=face',
        rating: '4.8',
        reviewCount: 134,
        completedJobs: 298,
        responseTime: 20,
        verified: true,
        available: true,
        planType: 'A',
        phone: '(51) 95555-4444',
        socialLinks: {
          whatsapp: '555195554444'
        },
        portfolioImages: []
      },
      {
        id: 'j2h8f01i-827f-845f-2if0-g0h287659109',
        documentType: 'CNPJ',
        displayName: 'Verde Jardins Ltda',
        bio: 'Empresa de jardinagem e paisagismo para residências e empresas.',
        companyName: 'Verde Jardins Paisagismo Ltda',
        tradeName: 'Verde Jardins',
        profession: 'Jardinagem',
        city: 'Goiânia',
        state: 'GO',
        foundedYear: 2018,
        employeeCount: 12,
        companyDescription: 'Especialistas em criação e manutenção de jardins, gramados e áreas verdes.',
        specialties: ['Paisagismo', 'Manutenção', 'Irrigação'],
        services: ['Projeto de jardim', 'Manutenção mensal', 'Sistema de irrigação'],
        profileImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
        rating: '4.6',
        reviewCount: 89,
        completedJobs: 67,
        responseTime: 45,
        verified: true,
        available: true,
        planType: 'B',
        phone: '(62) 3222-1111',
        website: 'https://verdejardins.com.br',
        socialLinks: {
          website: 'https://verdejardins.com.br',
          instagram: 'https://instagram.com/verdejardinsgo',
          facebook: 'https://facebook.com/verdejardins'
        },
        portfolioImages: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop'
        ]
      },
      {
        id: 'k3i9g12j-938g-956g-3jg1-h1i398760210',
        documentType: 'CPF',
        displayName: 'Paulo Santos',
        bio: 'Serralheiro especializado em portões, grades e estruturas metálicas.',
        profession: 'Serralheiro',
        city: 'Campinas',
        state: 'SP',
        specialties: ['Portões', 'Grades', 'Soldas', 'Estruturas metálicas'],
        services: ['Instalação de portões', 'Reparos', 'Soldas em geral'],
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
        rating: '4.5',
        reviewCount: 78,
        completedJobs: 56,
        responseTime: 40,
        verified: false,
        available: true,
        planType: 'A',
        phone: '(19) 94444-3333',
        socialLinks: {
          whatsapp: '551994443333'
        },
        portfolioImages: []
      }
    ];

    this.sampleProfiles = sampleProfilesData;
    
    // Seed some example conversations
    this.seedConversations();
  }

  private seedConversations() {
    // Create sample conversations
    const conversations = [
      {
        id: 'conv-assistant',
        participantId: 'assistant',
        participantName: 'Assistente Hive',
        participantType: 'assistant',
        lastMessage: 'Olá! Como posso ajudá-lo hoje?',
        lastMessageAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        unreadCount: 0,
        isOnline: true
      },
      {
        id: 'conv-joao',
        participantId: 'cfe135d3-a1bc-451e-87ac-45ab1c584f25',
        participantName: 'João Santos',
        participantImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        participantType: 'provider',
        lastMessage: 'Oi! Posso ajudar com sua demanda de elétrica.',
        lastMessageAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        unreadCount: 2,
        isOnline: true
      },
      {
        id: 'conv-maria',
        participantId: '61cfe2ef-bb3b-4960-bb1d-111492d7d997',
        participantName: 'Ana Costa',
        participantImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        participantType: 'provider',
        lastMessage: 'Enviei o orçamento por WhatsApp',
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        unreadCount: 0,
        isOnline: false
      }
    ];

    conversations.forEach(conv => {
      this.conversations.set(conv.id, conv);
    });

    // Create sample messages
    const messages = [
      {
        id: 'msg1',
        conversationId: 'conv-assistant',
        sender: 'assistant',
        message: 'Olá! Bem-vindo ao Hive. Como posso ajudá-lo hoje?',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isRead: true
      },
      {
        id: 'msg2',
        conversationId: 'conv-joao',
        sender: 'provider',
        message: 'Oi! Vi que você está procurando um eletricista.',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        isRead: true
      },
      {
        id: 'msg3',
        conversationId: 'conv-joao',
        sender: 'provider',
        message: 'Posso ajudar com sua demanda de elétrica. Qual o problema?',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        isRead: false
      },
      {
        id: 'msg4',
        conversationId: 'conv-maria',
        sender: 'user',
        message: 'Preciso de um orçamento para pintura da casa',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: true
      },
      {
        id: 'msg5',
        conversationId: 'conv-maria',
        sender: 'provider',
        message: 'Enviei o orçamento por WhatsApp. Dê uma olhada!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true
      }
    ];

    messages.forEach(msg => {
      this.chatMessages.set(msg.id, msg);
    });
  }

  // Properties
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(property => property.featured);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async incrementPropertyViews(id: string): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (property) {
      property.views = (property.views || 0) + 1;
      this.properties.set(id, property);
      return property;
    }
    return undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = { 
      ...insertProperty, 
      id, 
      views: 0, 
      status: "available",
      bedrooms: insertProperty.bedrooms || null,
      bathrooms: insertProperty.bathrooms || null,
      parkingSpaces: insertProperty.parkingSpaces || null,
      area: insertProperty.area || null
    };
    this.properties.set(id, property);
    return property;
  }

  // Service Providers
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values()).sort((a, b) => 
      parseFloat(b.rating || "0") - parseFloat(a.rating || "0")
    );
  }

  async getServiceProvidersByCategory(category: string): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values())
      .filter(provider => provider.categories.includes(category))
      .sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    return this.serviceProviders.get(id);
  }

  async createServiceProvider(insertProvider: InsertServiceProvider): Promise<ServiceProvider> {
    const id = randomUUID();
    const provider: ServiceProvider = { 
      ...insertProvider, 
      id, 
      rating: "0.0", 
      reviewCount: 0, 
      verified: false,
      description: insertProvider.description || null,
      phone: insertProvider.phone || null,
      email: insertProvider.email || null,
      portfolioImages: (insertProvider.portfolioImages as string[]) || []
    };
    this.serviceProviders.set(id, provider);
    return provider;
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.serviceCategories.values());
  }

  async getServiceCategory(slug: string): Promise<ServiceCategory | undefined> {
    return Array.from(this.serviceCategories.values()).find(cat => cat.slug === slug);
  }

  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const id = randomUUID();
    const category: ServiceCategory = { ...insertCategory, id, providerCount: 0 };
    this.serviceCategories.set(id, category);
    return category;
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = randomUUID();
    const plan: Plan = { 
      ...insertPlan, 
      id, 
      popular: insertPlan.popular || false,
      features: [...(insertPlan.features || [])]
    };
    this.plans.set(id, plan);
    return plan;
  }

  // Profile implementations
  async getUser(id: string): Promise<any> {
    return this.sampleUsers.find(u => u.id === id);
  }

  async upsertUser(user: any): Promise<any> {
    return user;
  }

  async getUserProfiles(params?: { documentType?: string; city?: string }): Promise<any[]> {
    let profiles = this.sampleProfiles;
    
    if (params?.documentType) {
      profiles = profiles.filter(p => p.documentType === params.documentType);
    }
    
    if (params?.city) {
      profiles = profiles.filter(p => p.city?.includes(params.city) || false);
    }
    
    return profiles;
  }

  async getUserProfile(id: string): Promise<any> {
    return this.sampleProfiles.find(p => p.id === id);
  }

  async createUserProfile(profile: any): Promise<any> {
    const newProfile = { ...profile, id: randomUUID() };
    this.sampleProfiles.push(newProfile);
    return newProfile;
  }

  // Chat and notifications methods
  private conversations: Map<string, any> = new Map();
  private chatMessages: Map<string, any> = new Map();
  private notifications: Map<string, any> = new Map();

  async getAllConversations(): Promise<any[]> {
    return Array.from(this.conversations.values());
  }

  async getConversationsByUserId(userId: string): Promise<any[]> {
    return Array.from(this.conversations.values()).filter(c => c.participantIds?.includes(userId));
  }

  async getOrCreateConversation(userId: string, providerId: string): Promise<any> {
    // Buscar conversa existente usando o participantId (não participantIds)
    const existingConversation = Array.from(this.conversations.values()).find(c => 
      c.participantId === providerId
    );
    
    if (existingConversation) {
      return existingConversation;
    }

    const providerProfile = this.sampleProfiles.find(p => p.id === providerId);
    
    const newConversation = {
      id: randomUUID(),
      participantId: providerId,
      participantName: providerProfile?.displayName || 'Profissional',
      participantImage: providerProfile?.profileImage,
      participantType: 'provider',
      lastMessage: 'Conversa iniciada',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      isOnline: Math.random() > 0.5
    };

    this.conversations.set(newConversation.id, newConversation);
    return newConversation;
  }

  async getMessagesByConversationId(conversationId: string): Promise<any[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime());
  }

  async createMessage(message: any): Promise<any> {
    const newMessage = {
      id: randomUUID(),
      conversationId: message.conversationId,
      senderId: message.senderId || message.sender,
      receiverId: message.receiverId,
      message: message.message,
      createdAt: message.createdAt || message.timestamp,
      read: message.read || message.isRead || false
    };

    this.chatMessages.set(newMessage.id, newMessage);

    // Update conversation last message
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessage = message.message;
      conversation.lastMessageAt = message.createdAt || message.timestamp;
    }

    return newMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    Array.from(this.chatMessages.values()).forEach(message => {
      if (message.conversationId === conversationId && message.sender !== 'user') {
        message.isRead = true;
      }
    });
  }

  // Notifications methods
  async getNotificationsByUserId(userId: string): Promise<any[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: any): Promise<any> {
    const newNotification = {
      id: randomUUID(),
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      isRead: false,
      relatedId: notification.relatedId || null,
      createdAt: new Date(),
    };

    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter((n: any) => n.userId === userId && !n.isRead).length;
  }

  async updateUserProfile(id: string, profile: any): Promise<any> {
    const index = this.sampleProfiles.findIndex(p => p.id === id);
    if (index >= 0) {
      this.sampleProfiles[index] = { ...this.sampleProfiles[index], ...profile };
      return this.sampleProfiles[index];
    }
    return undefined;
  }

  // Authentication operations
  async login(data: LoginData): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    const user = Array.from(this.users.values()).find(u => u.email === data.email);
    
    if (!user) {
      return { success: false, message: "Email ou senha incorretos" };
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Email ou senha incorretos" };
    }

    if (!user.isActive) {
      return { success: false, message: "Conta desativada" };
    }

    const authUser = await this.buildAuthUser(user);
    return { success: true, user: authUser };
  }

  async register(data: RegisterData): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    // Check if email already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === data.email);
    if (existingUser) {
      return { success: false, message: "Email já está em uso" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const userId = randomUUID();
    const user: SimpleUser = {
      id: userId,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      userType: data.userType,
      isActive: true,
    };

    this.users.set(userId, user);

    const authUser = await this.buildAuthUser(user);
    return { success: true, user: authUser };
  }

  async registerProvider(data: ProviderRegistrationData): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    // Check if email already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === data.email);
    if (existingUser) {
      return { success: false, message: "Email já está em uso" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const userId = randomUUID();
    const user: SimpleUser = {
      id: userId,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      userType: "provider",
      isActive: true,
    };

    // Create service provider profile
    const providerId = randomUUID();
    const provider: ServiceProvider = {
      id: providerId,
      userId: userId,
      name: data.name,
      speciality: data.speciality,
      description: data.description,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      location: data.location,
      rating: "0.0",
      reviewCount: 0,
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      portfolioImages: [],
      categories: data.categories,
      phone: data.phone,
      email: data.email,
      planType: data.planType,
      planActive: false, // Will be activated after payment
      verified: false,
    };

    user.providerId = providerId;
    
    this.users.set(userId, user);
    this.serviceProviders.set(providerId, provider);

    const authUser = await this.buildAuthUser(user);
    return { success: true, user: authUser };
  }

  async getUserByEmail(email: string): Promise<AuthUser | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return undefined;
    return this.buildAuthUser(user);
  }

  async canCreateProperty(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || user.userType !== "provider" || !user.providerId) {
      return false;
    }

    const provider = this.serviceProviders.get(user.providerId);
    if (!provider || !provider.planActive) {
      return false;
    }

    // Only real estate agencies can create properties
    return provider.categories.includes("imobiliaria");
  }

  async createPropertyAsProvider(userId: string, propertyData: CreatePropertyData): Promise<Property | null> {
    const canCreate = await this.canCreateProperty(userId);
    if (!canCreate) {
      return null;
    }

    const user = this.users.get(userId);
    const provider = this.serviceProviders.get(user!.providerId!);

    const propertyId = randomUUID();
    const property: Property = {
      id: propertyId,
      title: propertyData.title,
      description: propertyData.description,
      price: propertyData.price,
      priceType: propertyData.priceType,
      propertyType: propertyData.propertyType,
      location: propertyData.location,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      parkingSpaces: propertyData.parkingSpaces,
      area: propertyData.area,
      imageUrl: propertyData.imageUrl,
      images: propertyData.images,
      amenities: propertyData.amenities,
      agencyName: provider!.name,
      agencyId: provider!.id,
      agencyPhone: provider!.phone,
      agencyEmail: provider!.email,
      agencyLogo: provider!.imageUrl,
      status: "available",
      featured: false,
      views: 0,
      createdBy: userId,
    };

    this.properties.set(propertyId, property);
    return property;
  }

  private async buildAuthUser(user: SimpleUser): Promise<AuthUser> {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      isActive: user.isActive,
    };

    if (user.userType === "provider" && user.providerId) {
      const provider = this.serviceProviders.get(user.providerId);
      if (provider) {
        authUser.provider = {
          id: provider.id,
          categories: provider.categories,
          planType: provider.planType,
          planActive: provider.planActive,
          verified: provider.verified,
        };
      }
    }

    return authUser;
  }
}

// Usar MemStorage temporariamente para teste
export const storage = new MemStorage();
