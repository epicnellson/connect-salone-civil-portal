import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    category: v.string(),
    message: v.string(),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    await ctx.db.insert("feedback", {
      userId: userId || undefined,
      name: args.name,
      email: args.email,
      category: args.category,
      message: args.message,
      relatedEntityType: args.relatedEntityType,
      relatedEntityId: args.relatedEntityId,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject as Id<"users">))
      .first();
    if (!admin) throw new Error("Not an admin");
    return await ctx.db.query("feedback").order("desc").take(100);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("feedback"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject as Id<"users">))
      .first();
    if (!admin) throw new Error("Not an admin");
    await ctx.db.patch(args.id, { status: args.status });
  },
});
