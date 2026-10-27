import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountType: mysqlEnum("accountType", ["renter", "owner"]).default("renter").notNull(),
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  propertyType: mysqlEnum("propertyType", ["flat", "house", "apartment", "pg", "studio"]).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  locality: varchar("locality", { length: 160 }).notNull(),
  monthlyRent: int("monthlyRent").notNull(),
  bedrooms: int("bedrooms").default(1).notNull(),
  furnishing: mysqlEnum("furnishing", ["unfurnished", "semi_furnished", "fully_furnished"]).default("unfurnished").notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

export const ownerVerifications = mysqlTable("ownerVerifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyType: mysqlEnum("propertyType", ["flat", "house", "apartment", "pg", "studio"]).notNull(),
  proofType: mysqlEnum("proofType", ["government_id", "ownership_document", "gst_certificate", "rental_authorization"]).notNull(),
  proofUrl: varchar("proofUrl", { length: 1000 }).notNull(),
  proofFileName: varchar("proofFileName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export type OwnerVerification = typeof ownerVerifications.$inferSelect;
export type InsertOwnerVerification = typeof ownerVerifications.$inferInsert;
