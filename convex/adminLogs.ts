import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

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
    return await ctx.db
      .query("adminLogs")
      .order("desc")
      .take(100);
  },
});

export const log = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject as Id<"users">))
      .first();
    if (!user) throw new Error("Not an admin");
    await ctx.db.insert("adminLogs", {
      adminId: identity.subject as Id<"users">,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      details: args.details,
      timestamp: Date.now(),
    });
  },
});
