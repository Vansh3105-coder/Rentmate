import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ownerProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const propertyInput = z.object({
  title: z.string().trim().min(3).max(160),
  propertyType: z.enum(["flat", "house", "apartment", "pg", "studio"]),
  city: z.string().trim().min(2).max(120),
  locality: z.string().trim().min(2).max(160),
  monthlyRent: z.number().int().min(0).max(10_000_000),
  bedrooms: z.number().int().min(1).max(20),
  furnishing: z.enum(["unfurnished", "semi_furnished", "fully_furnished"]),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().url().max(1000).optional().or(z.literal("")),
});

const profileInput = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+0-9 ()-]{7,32}$/, "Enter a valid contact number"),
  accountType: z.enum(["renter", "owner"]),
});

const ownerProofInput = z.object({
  propertyType: z.enum(["flat", "house", "apartment", "pg", "studio"]),
  proofType: z.enum(["government_id", "ownership_document", "gst_certificate", "rental_authorization"]),
  proofFileName: z.string().trim().min(1).max(255),
  proofDataUrl: z.string().regex(/^data:(application\/pdf|image\/(jpeg|png));base64,/, "Upload a PDF, JPG, or PNG proof document").max(12_000_000),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  account: router({
    status: protectedProcedure.query(async ({ ctx }) => ({
      user: ctx.user,
      verification: await db.getLatestOwnerVerification(ctx.user.id),
    })),
    saveProfile: protectedProcedure.input(profileInput).mutation(({ ctx, input }) =>
      db.updateUserProfile(ctx.user.id, {
        name: input.name,
        phone: input.phone,
        accountType: input.accountType,
        onboardingComplete: input.accountType === "renter",
      })
    ),
    submitOwnerProof: protectedProcedure.input(ownerProofInput).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "owner") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Choose the owner profile before submitting verification." });
      }
      const match = input.proofDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid proof document." });
      const contentType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Proof documents must be 8 MB or smaller." });
      const safeName = input.proofFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const stored = await storagePut(`owner-verification/${ctx.user.id}/${safeName}`, buffer, contentType);
      await db.updateUserProfile(ctx.user.id, {
        name: ctx.user.name ?? "Nestly owner",
        phone: ctx.user.phone ?? "",
        accountType: "owner",
        onboardingComplete: true,
      });
      return db.createOwnerVerification({
        userId: ctx.user.id,
        propertyType: input.propertyType,
        proofType: input.proofType,
        proofUrl: stored.url,
        proofFileName: safeName,
        status: "pending",
      });
    }),
  }),

  owner: router({
    list: ownerProcedure.query(({ ctx }) => db.getPropertiesByOwnerId(ctx.user.id)),
    create: ownerProcedure.input(propertyInput).mutation(({ ctx, input }) =>
      db.createProperty({
        ...input,
        ownerId: ctx.user.id,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
        status: "draft",
      })
    ),
    update: ownerProcedure.input(propertyInput.extend({ propertyId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const { propertyId, ...property } = input;
      const updated = await db.updateProperty(ctx.user.id, propertyId, {
        ...property,
        description: property.description || null,
        imageUrl: property.imageUrl || null,
      });
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      return updated;
    }),
    updateStatus: ownerProcedure.input(z.object({
      propertyId: z.number().int().positive(),
      status: z.enum(["draft", "published", "archived"]),
    })).mutation(({ ctx, input }) => db.updatePropertyStatus(ctx.user.id, input.propertyId, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
