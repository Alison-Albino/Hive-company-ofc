import {
  properties,
  serviceProviders,
  serviceCategories,
  plans,
  users,
  userProfiles,
  reviews,
  chatMessages,
  conversations,
  type Property,
  type InsertProperty,
  type ServiceProvider,
  type InsertServiceProvider,
  type ServiceCategory,
  type InsertServiceCategory,
  type Plan,
  type InsertPlan,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Review,
  type InsertReview,
  type ChatMessage,
  type InsertChatMessage,
  type Conversation,
  type InsertConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, asc, inArray } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Property operations
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.id));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.featured, true)).limit(6);
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties).values(property).returning();
    return created;
  }

  async updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set(property)
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  // Service provider operations
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return await db.select().from(serviceProviders).orderBy(desc(serviceProviders.rating));
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [created] = await db.insert(serviceProviders).values(provider).returning();
    return created;
  }

  // Service category operations
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).orderBy(asc(serviceCategories.name));
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [created] = await db.insert(serviceCategories).values(category).returning();
    return created;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans).orderBy(asc(plans.type));
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [created] = await db.insert(plans).values(plan).returning();
    return created;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfiles(params?: { 
    documentType?: string; 
    city?: string; 
    specialties?: string[] 
  }): Promise<UserProfile[]> {
    let query = db.select().from(userProfiles);

    if (params?.documentType) {
      query = query.where(eq(userProfiles.documentType, params.documentType));
    }
    
    if (params?.city) {
      query = query.where(like(userProfiles.city, `%${params.city}%`));
    }

    return await query.orderBy(desc(userProfiles.rating), desc(userProfiles.lastActive));
  }

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return profile;
  }

  async getUserProfileByDocumentNumber(documentNumber: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.documentNumber, documentNumber));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    return updated;
  }

  // Review operations
  async getProfileReviews(profileId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.profileId, profileId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    
    // Update profile rating and review count
    const profileReviews = await this.getProfileReviews(review.profileId);
    const avgRating = profileReviews.reduce((sum, r) => sum + r.rating, 0) / profileReviews.length;
    
    await db
      .update(userProfiles)
      .set({
        rating: avgRating.toFixed(1),
        reviewCount: profileReviews.length,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, review.profileId));
    
    return created;
  }

  // Chat operations
  async getConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(like(conversations.participantIds, `%${userId}%`))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation).returning();
    return created;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    
    // Update conversation last message
    await db
      .update(conversations)
      .set({
        lastMessage: message.message,
        lastMessageAt: new Date(),
      })
      .where(eq(conversations.id, message.conversationId));
    
    return created;
  }
}