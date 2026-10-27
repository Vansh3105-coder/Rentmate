import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertOwnerVerification, InsertProperty, InsertUser, ownerVerifications, properties, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, profile: Pick<InsertUser, "name" | "phone" | "accountType" | "onboardingComplete">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set(profile).where(eq(users.id, userId));
  const updated = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return updated[0];
}

export async function createOwnerVerification(verification: InsertOwnerVerification) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(ownerVerifications).values(verification);
  const created = await db.select().from(ownerVerifications).where(eq(ownerVerifications.id, result[0].insertId)).limit(1);
  return created[0];
}

export async function getLatestOwnerVerification(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(ownerVerifications).where(eq(ownerVerifications.userId, userId)).orderBy(desc(ownerVerifications.submittedAt)).limit(1);
  return result[0];
}

export async function getPropertiesByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(properties).where(eq(properties.ownerId, ownerId)).orderBy(desc(properties.createdAt));
}

export async function createProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(properties).values(property);
  const created = await db.select().from(properties).where(eq(properties.id, result[0].insertId)).limit(1);
  return created[0];
}

export async function updateProperty(ownerId: number, propertyId: number, property: Omit<InsertProperty, "ownerId" | "status">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(properties).set(property).where(and(eq(properties.id, propertyId), eq(properties.ownerId, ownerId)));
  const updated = await db.select().from(properties).where(and(eq(properties.id, propertyId), eq(properties.ownerId, ownerId))).limit(1);
  return updated[0];
}

export async function updatePropertyStatus(ownerId: number, propertyId: number, status: "draft" | "published" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(properties).set({ status }).where(and(eq(properties.id, propertyId), eq(properties.ownerId, ownerId)));
  const owned = await db.select().from(properties).where(and(eq(properties.id, propertyId), eq(properties.ownerId, ownerId))).limit(1);
  return owned[0];
}
