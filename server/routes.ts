import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, providerRegistrationSchema, createPropertySchema } from "@shared/auth-schema";
import type { AuthUser } from "@shared/auth-schema";

// Simple session storage (in production, use proper session management)
interface Session {
  userId: string;
  user: AuthUser;
}

const sessions = new Map<string, Session>();

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  
  const session = sessions.get(sessionId)!;
  req.user = session.user;
  req.userId = session.userId;
  next();
}

// Middleware to check if user is a provider
function requireProvider(req: any, res: any, next: any) {
  if (req.user.userType !== "provider") {
    return res.status(403).json({ message: "Acesso restrito a prestadores de serviços" });
  }
  next();
}

// Middleware to check if user is a real estate provider
function requireRealEstateProvider(req: any, res: any, next: any) {
  if (!req.user.provider || !req.user.provider.categories.includes("imobiliaria")) {
    return res.status(403).json({ message: "Apenas imobiliárias podem cadastrar propriedades" });
  }
  
  if (!req.user.provider.planActive) {
    return res.status(403).json({ message: "Plano inativo. Assine um plano para cadastrar propriedades" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await storage.login(validatedData);
      
      if (result.success && result.user) {
        const sessionId = `session_${Date.now()}_${Math.random()}`;
        sessions.set(sessionId, { userId: result.user.id, user: result.user });
        
        res.json({
          success: true,
          user: result.user,
          sessionId: sessionId
        });
      } else {
        res.status(401).json(result);
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Dados inválidos" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await storage.register(validatedData);
      
      if (result.success && result.user) {
        const sessionId = `session_${Date.now()}_${Math.random()}`;
        sessions.set(sessionId, { userId: result.user.id, user: result.user });
        
        res.json({
          success: true,
          user: result.user,
          sessionId: sessionId
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Dados inválidos" });
    }
  });

  app.post("/api/auth/register-provider", async (req, res) => {
    try {
      const validatedData = providerRegistrationSchema.parse(req.body);
      const result = await storage.registerProvider(validatedData);
      
      if (result.success && result.user) {
        const sessionId = `session_${Date.now()}_${Math.random()}`;
        sessions.set(sessionId, { userId: result.user.id, user: result.user });
        
        res.json({
          success: true,
          user: result.user,
          sessionId: sessionId,
          message: "Cadastro realizado! Complete o pagamento do plano para ativar sua conta."
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Dados inválidos" });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: (req as any).user });
  });

  // Provider property creation endpoint
  app.post("/api/properties", requireAuth, requireRealEstateProvider, async (req, res) => {
    try {
      const validatedData = createPropertySchema.parse(req.body);
      const property = await storage.createPropertyAsProvider((req as any).userId, validatedData);
      
      if (property) {
        res.status(201).json({ success: true, property });
      } else {
        res.status(403).json({ 
          success: false, 
          message: "Não foi possível criar a propriedade. Verifique suas permissões e plano ativo." 
        });
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Dados inválidos" });
    }
  });
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

  // Property views endpoint
  app.post("/api/properties/:id/view", async (req, res) => {
    try {
      const property = await storage.incrementPropertyViews(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json({ success: true, views: property.views });
    } catch (error) {
      res.status(500).json({ message: "Error updating property views" });
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

  app.get('/api/profiles/:id/reviews', async (req, res) => {
    try {
      // Retornar array vazio temporariamente - implementar depois
      res.json([]);
    } catch (error) {
      console.error('Error fetching profile reviews:', error);
      res.status(500).json({ message: 'Error fetching profile reviews' });
    }
  });

  // Chat endpoint - Assistant
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    try {
      // Criar mensagem do usuário na conversa do assistente
      await storage.createMessage({
        conversationId: 'conv-assistant',
        senderId: 'user',
        receiverId: 'assistant',
        message,
        createdAt: new Date().toISOString(),
        read: false
      });

      // Simular resposta do assistente
      const responses = {
        ola: "Olá! Como posso ajudá-lo hoje? Está procurando por alguma propriedade específica?",
        ajuda: "Estou aqui para ajudar! Você pode buscar propriedades por localização, ver detalhes de imóveis ou encontrar prestadores de serviços.",
        propriedades: "Temos várias propriedades disponíveis! Use o mapa para explorar diferentes regiões ou digite uma localização específica na busca.",
        servicos: "Temos prestadores qualificados em várias categorias! Que tipo de serviço você precisa?",
        default: "Interessante! Como posso ajudá-lo com propriedades ou serviços? Digite sua dúvida e eu terei prazer em ajudar."
      };

      const lowerMessage = message.toLowerCase();
      let response = responses.default;

      for (const [key, value] of Object.entries(responses)) {
        if (key !== "default" && lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }

      // Criar resposta do assistente
      await storage.createMessage({
        conversationId: 'conv-assistant',
        senderId: 'assistant',
        receiverId: 'user',
        message: response,
        createdAt: new Date().toISOString(),
        read: false
      });

      res.json({
        message: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in chat:', error);
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  });

  // Chat endpoints
  app.get('/api/chat/conversations', async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  });

  app.post('/api/chat/conversations', async (req, res) => {
    try {
      const { providerId } = req.body;
      if (!providerId) {
        return res.status(400).json({ message: 'Provider ID is required' });
      }
      const userId = 'mock-user-id'; // Mock user ID for demo
      const conversation = await storage.getOrCreateConversation(userId, providerId);
      res.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ message: 'Failed to create conversation' });
    }
  });

  app.get('/api/chat/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/chat/conversations/:id/messages', async (req, res) => {
    try {
      const { message, receiverId } = req.body;
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }
      
      // Criar mensagem do usuário
      const userMessage = await storage.createMessage({
        conversationId: req.params.id,
        senderId: 'user',
        receiverId: receiverId || 'provider',
        message,
        createdAt: new Date().toISOString(),
        read: false
      });

      // Se não é o assistente, simular resposta do prestador
      if (req.params.id !== 'conv-assistant') {
        setTimeout(async () => {
          const responses = [
            "Olá! Obrigado por entrar em contato. Como posso ajudar?",
            "Oi! Vou verificar sua demanda e retorno já com o orçamento.",
            "Entendi sua necessidade. Posso fazer o trabalho sim, quando precisa?",
            "Perfeito! Tenho disponibilidade para atender. Vamos conversar melhor?",
            "Boa tarde! Recebi sua mensagem. Posso ajudar sim com esse serviço."
          ];
          
          await storage.createMessage({
            conversationId: req.params.id,
            senderId: receiverId || 'provider',
            receiverId: 'user',
            message: responses[Math.floor(Math.random() * responses.length)],
            createdAt: new Date().toISOString(),
            read: false
          });
        }, 2000);
      }

      res.json(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Notifications endpoints
  app.get('/api/notifications', async (req, res) => {
    try {
      const userId = 'mock-user-id'; // Mock user ID for demo
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  app.get('/api/notifications/count', async (req, res) => {
    try {
      const userId = 'mock-user-id'; // Mock user ID for demo
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching notification count:', error);
      res.status(500).json({ message: 'Failed to fetch notification count' });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
