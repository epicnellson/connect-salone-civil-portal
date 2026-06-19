import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLatestCode = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "password"),
          q.eq(q.field("providerAccountId"), args.email),
        ),
      )
      .first();
    if (!account) return null;
    const code = await ctx.db
      .query("authVerificationCodes")
      .filter((q) => q.eq(q.field("accountId"), account._id))
      .order("desc")
      .first();
    if (!code) return null;
    if (code.expirationTime < Date.now()) return null;
    return { code: code.code, expiresAt: code.expirationTime };
  },
});
