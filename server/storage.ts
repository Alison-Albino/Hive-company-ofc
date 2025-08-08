import { type Property, type InsertProperty, type ServiceProvider, type InsertServiceProvider, type ServiceCategory, type InsertServiceCategory, type Plan, type InsertPlan } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
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
}

export class MemStorage implements IStorage {
  private properties: Map<string, Property>;
  private serviceProviders: Map<string, ServiceProvider>;
  private serviceCategories: Map<string, ServiceCategory>;
  private plans: Map<string, Plan>;

  constructor() {
    this.properties = new Map();
    this.serviceProviders = new Map();
    this.serviceCategories = new Map();
    this.plans = new Map();
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
        status: "available",
        featured: true,
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
      { id: randomUUID(), name: "Mudanças", icon: "fas fa-truck", slug: "moving", providerCount: 81 }
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

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = { ...insertProperty, id, views: 0 };
    this.properties.set(id, property);
    return property;
  }

  // Service Providers
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values()).sort((a, b) => 
      parseFloat(b.rating) - parseFloat(a.rating)
    );
  }

  async getServiceProvidersByCategory(category: string): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values())
      .filter(provider => provider.categories.includes(category))
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
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
      verified: false 
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
    const plan: Plan = { ...insertPlan, id };
    this.plans.set(id, plan);
    return plan;
  }
}

export const storage = new MemStorage();
