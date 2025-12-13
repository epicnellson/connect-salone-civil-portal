import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  services: defineTable({
    name: v.string(),
    ministry: v.string(),
    category: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    officialFees: v.string(),
    processingTime: v.string(),
    locations: v.array(v.string()),
    contactInfo: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
  })
    .index("by_ministry", ["ministry"])
    .index("by_category", ["category"])
    .searchIndex("search_services", {
      searchField: "name",
      filterFields: ["ministry", "category"],
    }),

  representatives: defineTable({
    name: v.string(),
    title: v.string(),
    ministry: v.string(),
    district: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    office: v.string(),
    officeAddress: v.string(),
  })
    .index("by_district", ["district"])
    .index("by_ministry", ["ministry"])
    .searchIndex("search_representatives", {
      searchField: "name",
      filterFields: ["district", "ministry"],
    }),

  chatMessages: defineTable({
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    message: v.string(),
    response: v.string(),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
