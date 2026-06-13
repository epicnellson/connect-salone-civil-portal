import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getAllServices = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("services").paginate(args.paginationOpts);
  },
});

export const searchServices = query({
  args: {
    searchTerm: v.optional(v.string()),
    agency: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.searchTerm) {
      return await ctx.db
        .query("services")
        .withSearchIndex("search_services", (q) => {
          let searchQuery = q.search("name", args.searchTerm!);
          if (args.agency) {
            searchQuery = searchQuery.eq("agency", args.agency);
          }
          if (args.region) {
            searchQuery = searchQuery.eq("region", args.region);
          }
          return searchQuery;
        })
        .collect();
    } else if (args.agency) {
      return await ctx.db
        .query("services")
        .withIndex("by_agency", (q) => q.eq("agency", args.agency!))
        .collect();
    } else if (args.region) {
      return await ctx.db
        .query("services")
        .withIndex("by_region", (q) => q.eq("region", args.region!))
        .collect();
    } else {
      return await ctx.db.query("services").collect();
    }
  },
});

export const getServicesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("services").paginate(args.paginationOpts);
  },
});

export const searchServicesPaginated = query({
  args: {
    searchTerm: v.optional(v.string()),
    agency: v.optional(v.string()),
    region: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { paginationOpts, searchTerm, agency, region } = args;
    if (searchTerm) {
      return await ctx.db
        .query("services")
        .withSearchIndex("search_services", (q) => {
          let searchQuery = q.search("name", searchTerm);
          if (agency) searchQuery = searchQuery.eq("agency", agency);
          if (region) searchQuery = searchQuery.eq("region", region);
          return searchQuery;
        })
        .paginate(paginationOpts);
    }
    if (agency) {
      return await ctx.db
        .query("services")
        .withIndex("by_agency", (q) => q.eq("agency", agency))
        .paginate(paginationOpts);
    }
    if (region) {
      return await ctx.db
        .query("services")
        .withIndex("by_region", (q) => q.eq("region", region))
        .paginate(paginationOpts);
    }
    return await ctx.db.query("services").paginate(paginationOpts);
  },
});

export const getAgencies = query({
  args: {},
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    const agencies = [...new Set(services.map((s) => s.agency))];
    return agencies.sort();
  },
});

export const createService = mutation({
  args: {
    name: v.string(),
    agency: v.string(),
    fee: v.string(),
    processingTime: v.string(),
    documents: v.array(v.string()),
    eligibility: v.string(),
    processSteps: v.array(v.string()),
    locations: v.array(v.string()),
    contacts: v.string(),
    notes: v.string(),
    lastVerified: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", args);
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    agency: v.string(),
    fee: v.string(),
    processingTime: v.string(),
    documents: v.array(v.string()),
    eligibility: v.string(),
    processSteps: v.array(v.string()),
    locations: v.array(v.string()),
    contacts: v.string(),
    notes: v.string(),
    lastVerified: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
