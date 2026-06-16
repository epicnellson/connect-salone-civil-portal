import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject as Id<"users">))
      .first();
    if (!admin) throw new Error("Not an admin");

    const [services, representatives, feedback, logs, users] = await Promise.all([
      ctx.db.query("services").collect(),
      ctx.db.query("representatives").collect(),
      ctx.db.query("feedback").collect(),
      ctx.db.query("adminLogs").order("desc").take(10),
      ctx.db.query("users").collect(),
    ]);

    const openFeedback = feedback.filter((f) => f.status === "open").length;

    return {
      totalServices: services.length,
      totalRepresentatives: representatives.length,
      totalUsers: users.length,
      openFeedbackCount: openFeedback,
      totalFeedbackCount: feedback.length,
      recentLogs: logs,
    };
  },
});
