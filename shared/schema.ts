import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, jsonb, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";



export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceType: varchar("price_type", { length: 20 }).notNull(), // 'sale', 'rent', 'event'
  propertyType: varchar("property_type", { length: 50 }).notNull(), // 'apartment', 'house', 'commercial', 'event_hall'
  location: text("location").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  parkingSpaces: integer("parking_spaces"),
  area: integer("area"), // in m²
  imageUrl: text("image_url").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  agencyName: text("agency_name").notNull(),
  agencyId: varchar("agency_id").references(() => serviceProviders.id), // Reference to service provider (real estate agency)
  agencyLogo: text("agency_logo"),
  status: varchar("status", { length: 20 }).default("available"), // 'available', 'sold', 'rented'
  featured: boolean("featured").default(false),
  views: integer("views").default(0),
  createdBy: varchar("created_by").references(() => users.id),
});

export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  speciality: text("speciality").notNull(),
  description: text("description"),
  documentType: varchar("document_type", { length: 10 }).notNull(), // 'CPF', 'CNPJ'
  documentNumber: text("document_number").notNull(),
  location: text("location").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url").notNull(),
  portfolioImages: jsonb("portfolio_images").$type<string[]>().default([]),
  categories: jsonb("categories").$type<string[]>().notNull(),
  planType: varchar("plan_type", { length: 10 }).default("A"), // 'A' or 'B'
  planActive: boolean("plan_active").default(false),
  verified: boolean("verified").default(false),
});

export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(), // Font Awesome class
  slug: text("slug").notNull().unique(),
  providerCount: integer("provider_count").default(0),
  subcategories: text("subcategories").array().default([]),
  planType: varchar("plan_type", { length: 10 }).notNull().default("CPF"), // CPF ou CNPJ
});

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'A' or 'B'
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  targetAudience: text("target_audience").notNull(), // 'CPF' or 'CNPJ'
  popular: boolean("popular").default(false),
});

// Insert schemas
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  views: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  rating: true,
  reviewCount: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  providerCount: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
});

// Types
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

// User profiles and authentication tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: text("password"),
  name: text("name"),
  userType: varchar("user_type", { length: 20 }).default("viewer"), // 'viewer', 'provider'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  documentType: varchar("document_type", { length: 4 }).notNull(), // 'CPF' or 'CNPJ'
  documentNumber: varchar("document_number").unique().notNull(),
  
  // Dados pessoais/empresariais básicos
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  
  // Dados específicos para CNPJ
  companyName: text("company_name"), // Para CNPJ
  tradeName: text("trade_name"), // Para CNPJ
  foundedYear: integer("founded_year"), // Para CNPJ
  employeeCount: integer("employee_count"), // Para CNPJ
  companyDescription: text("company_description"), // Para CNPJ
  website: varchar("website"), // Para CNPJ
  
  // Dados profissionais
  profession: varchar("profession"),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  services: jsonb("services").$type<string[]>().default([]),
  serviceAreas: jsonb("service_areas").$type<string[]>().default([]),
  
  // Portfolio e mídia
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  portfolioImages: jsonb("portfolio_images").$type<string[]>().default([]),
  portfolioVideos: jsonb("portfolio_videos").$type<string[]>().default([]),
  
  // Redes sociais
  socialLinks: jsonb("social_links").$type<{
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    whatsapp?: string;
    website?: string;
  }>().default({}),
  
  // Avaliações e estatísticas
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  completedJobs: integer("completed_jobs").default(0),
  responseTime: integer("response_time").default(0), // em minutos
  
  // Status e verificações
  verified: boolean("verified").default(false),
  available: boolean("available").default(true),
  planType: varchar("plan_type", { length: 1 }).default("A"), // 'A' ou 'B'
  
  // Dados técnicos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  reviewerId: varchar("reviewer_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  serviceType: varchar("service_type"),
  images: jsonb("images").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"), // 'text', 'image', 'file'
  attachments: jsonb("attachments").$type<string[]>().default([]),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantIds: jsonb("participant_ids").$type<string[]>().notNull(),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  paymentHistory: many(paymentHistory),
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [paymentHistory.subscriptionId],
    references: [subscriptions.id],
  }),
  user: one(users, {
    fields: [paymentHistory.userId],
    references: [users.id],
  }),
}));



export const reviewsRelations = relations(reviews, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [reviews.profileId],
    references: [userProfiles.id],
  }),
  reviewer: one(userProfiles, {
    fields: [reviews.reviewerId],
    references: [userProfiles.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(userProfiles, {
    fields: [chatMessages.senderId],
    references: [userProfiles.id],
  }),
  receiver: one(userProfiles, {
    fields: [chatMessages.receiverId],
    references: [userProfiles.id],
  }),
  conversation: one(conversations, {
    fields: [chatMessages.conversationId],
    references: [conversations.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(chatMessages),
}));

// Tabela de notificações
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // message, booking, review
  title: varchar("title").notNull(),
  content: varchar("content").notNull(),
  isRead: boolean("is_read").default(false),
  relatedId: varchar("related_id"), // conversation_id, booking_id, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de assinaturas
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  planType: varchar("plan_type", { length: 1 }).notNull(), // 'A' ou 'B'
  planName: text("plan_name").notNull(), // 'BE HIVE' ou 'HIVE GOLD'
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'cancelled', 'expired', 'cancellation_pending'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  cancellationDeadline: timestamp("cancellation_deadline").notNull(), // 7 dias após start_date
  cancelledAt: timestamp("cancelled_at"),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de histórico de pagamentos
export const paymentHistory = pgTable("payment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull(),
  userId: varchar("user_id").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: varchar("status", { length: 20 }).notNull(), // 'succeeded', 'failed', 'pending', 'refunded'
  paymentMethod: varchar("payment_method").notNull(), // 'card', 'apple_pay', 'google_pay', etc.
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  rating: true,
  reviewCount: true,
  completedJobs: true,
  createdAt: true,
  updatedAt: true,
  lastActive: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
