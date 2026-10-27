import { relations } from "drizzle-orm";
import { ownerVerifications, properties, users } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  ownerVerifications: many(ownerVerifications),
}));

export const propertiesRelations = relations(properties, ({ one }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
}));

export const ownerVerificationsRelations = relations(ownerVerifications, ({ one }) => ({
  user: one(users, {
    fields: [ownerVerifications.userId],
    references: [users.id],
  }),
}));
