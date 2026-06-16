import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  services: defineTable({
    name: v.string(),
    agency: v.optional(v.string()),
    fee: v.optional(v.string()),
    processingTime: v.optional(v.string()),
    documents: v.optional(v.array(v.string())),
    eligibility: v.optional(v.string()),
    processSteps: v.optional(v.array(v.string())),
    locations: v.optional(v.array(v.string())),
    contacts: v.optional(v.string()),
    notes: v.optional(v.string()),
    lastVerified: v.optional(v.string()),
    region: v.optional(v.string()),
    ministry: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    officialFees: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
  })
    .index("by_agency", ["agency"])
    .index("by_region", ["region"])
    .searchIndex("search_services", {
      searchField: "name",
      filterFields: ["agency", "region"],
    }),

  representatives: defineTable({
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
  })
    .index("by_district", ["district"])
    .index("by_role", ["role"])
    .searchIndex("search_representatives", {
      searchField: "name",
      filterFields: ["district", "role"],
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

  admins: defineTable({
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  feedback: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    email: v.optional(v.string()),
    category: v.string(),
    message: v.string(),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"]),

  adminLogs: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_admin", ["adminId"])
    .index("by_entityType", ["entityType"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
