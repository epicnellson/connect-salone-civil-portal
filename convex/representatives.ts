import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const searchRepresentatives = query({
  args: {
    searchTerm: v.optional(v.string()),
    district: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.searchTerm) {
      return await ctx.db
        .query("representatives")
        .withSearchIndex("search_representatives", (q) => {
          let searchQuery = q.search("name", args.searchTerm!);
          if (args.district) {
            searchQuery = searchQuery.eq("district", args.district);
          }
          if (args.role) {
            searchQuery = searchQuery.eq("role", args.role);
          }
          return searchQuery;
        })
        .collect();
    } else if (args.district) {
      return await ctx.db
        .query("representatives")
        .withIndex("by_district", (q) => q.eq("district", args.district!))
        .collect();
    } else if (args.role) {
      return await ctx.db
        .query("representatives")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      return await ctx.db.query("representatives").collect();
    }
  },
});

export const getDistricts = query({
  args: {},
  handler: async (ctx) => {
    const representatives = await ctx.db.query("representatives").collect();
    const districts = [...new Set(representatives.map((r) => r.district))];
    return districts.sort();
  },
});

export const getRoles = query({
  args: {},
  handler: async (ctx) => {
    const representatives = await ctx.db.query("representatives").collect();
    const roles = [...new Set(representatives.map((r) => r.role))];
    return roles.sort();
  },
});

export const getAllRepresentatives = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("representatives").paginate(args.paginationOpts);
  },
});

export const getRepresentativesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("representatives").paginate(args.paginationOpts);
  },
});

export const searchRepresentativesPaginated = query({
  args: {
    searchTerm: v.optional(v.string()),
    district: v.optional(v.string()),
    role: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { paginationOpts, searchTerm, district, role } = args;
    if (searchTerm) {
      return await ctx.db
        .query("representatives")
        .withSearchIndex("search_representatives", (q) => {
          let searchQuery = q.search("name", searchTerm);
          if (district) searchQuery = searchQuery.eq("district", district);
          if (role) searchQuery = searchQuery.eq("role", role);
          return searchQuery;
        })
        .paginate(paginationOpts);
    }
    if (district) {
      return await ctx.db
        .query("representatives")
        .withIndex("by_district", (q) => q.eq("district", district))
        .paginate(paginationOpts);
    }
    if (role) {
      return await ctx.db
        .query("representatives")
        .withIndex("by_role", (q) => q.eq("role", role))
        .paginate(paginationOpts);
    }
    return await ctx.db.query("representatives").paginate(paginationOpts);
  },
});

export const createRepresentative = mutation({
  args: {
    name: v.string(),
    role: v.optional(v.string()),
    district: v.string(),
    constituency: v.optional(v.string()),
    phone: v.string(),
    email: v.string(),
    title: v.optional(v.string()),
    ministry: v.optional(v.string()),
    office: v.optional(v.string()),
    officeAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("representatives", args);
  },
});

export const updateRepresentative = mutation({
  args: {
    id: v.id("representatives"),
    name: v.string(),
    role: v.optional(v.string()),
    district: v.string(),
    constituency: v.optional(v.string()),
    phone: v.string(),
    email: v.string(),
    title: v.optional(v.string()),
    ministry: v.optional(v.string()),
    office: v.optional(v.string()),
    officeAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteRepresentative = mutation({
  args: {
    id: v.id("representatives"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
