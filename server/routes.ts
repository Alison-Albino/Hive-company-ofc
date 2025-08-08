import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties" });
    }
  });

  app.get("/api/properties/featured", async (req, res) => {
    try {
      const properties = await storage.getFeaturedProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property" });
    }
  });

  // Service providers routes
  app.get("/api/service-providers", async (req, res) => {
    try {
      const category = req.query.category as string;
      const providers = category 
        ? await storage.getServiceProvidersByCategory(category)
        : await storage.getServiceProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching service providers" });
    }
  });

  app.get("/api/service-providers/:id", async (req, res) => {
    try {
      const provider = await storage.getServiceProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: "Error fetching service provider" });
    }
  });

  // Service categories routes
  app.get("/api/service-categories", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching service categories" });
    }
  });

  // Plans routes
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching plans" });
    }
  });

  // Config endpoint for maps key
  app.get('/api/config/maps-key', (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      res.send(apiKey);
    } else {
      res.status(404).send('API key not found');
    }
  });

  // Profile routes
  app.get('/api/profiles', async (req, res) => {
    try {
      const { documentType, city } = req.query;
      const profiles = await storage.getUserProfiles({ 
        documentType: documentType as string,
        city: city as string 
      });
      res.json(profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      res.status(500).json({ message: 'Error fetching profiles' });
    }
  });

  app.get('/api/profiles/:id', async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  });

  // Chat endpoint
  app.post("/api/chat", (req, res) => {
    const { message } = req.body;

    // Simular resposta do chat baseada na mensagem
    const responses = {
      ola: "Olá! Como posso ajudá-lo hoje? Está procurando por alguma propriedade específica?",
      ajuda:
        "Estou aqui para ajudar! Você pode buscar propriedades por localização, ver detalhes de imóveis ou encontrar prestadores de serviços.",
      propriedades:
        "Temos várias propriedades disponíveis! Use o mapa para explorar diferentes regiões ou digite uma localização específica na busca.",
      default:
        "Interessante! Como posso ajudá-lo com propriedades ou serviços? Digite sua dúvida e eu terei prazer em ajudar.",
    };

    const lowerMessage = message.toLowerCase();
    let response = responses.default;

    for (const [key, value] of Object.entries(responses)) {
      if (key !== "default" && lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }

    res.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
