import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
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
  status: varchar("status", { length: 20 }).default("available"), // 'available', 'sold', 'rented'
  featured: boolean("featured").default(false),
  views: integer("views").default(0),
});

export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  speciality: text("speciality").notNull(),
  description: text("description"),
  documentType: varchar("document_type", { length: 10 }).notNull(), // 'CPF', 'CNPJ'
  location: text("location").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url").notNull(),
  portfolioImages: jsonb("portfolio_images").$type<string[]>().default([]),
  categories: jsonb("categories").$type<string[]>().notNull(),
  phone: text("phone"),
  email: text("email"),
  planType: varchar("plan_type", { length: 10 }).default("A"), // 'A' or 'B'
  verified: boolean("verified").default(false),
});

export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(), // Font Awesome class
  slug: text("slug").notNull().unique(),
  providerCount: integer("provider_count").default(0),
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
