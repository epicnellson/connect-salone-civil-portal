import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllServices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

export const searchServices = query({
  args: {
    searchTerm: v.optional(v.string()),
    ministry: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.searchTerm) {
      return await ctx.db
        .query("services")
        .withSearchIndex("search_services", (q) => {
          let searchQuery = q.search("name", args.searchTerm!);
          if (args.ministry) {
            searchQuery = searchQuery.eq("ministry", args.ministry);
          }
          if (args.category) {
            searchQuery = searchQuery.eq("category", args.category);
          }
          return searchQuery;
        })
        .collect();
    } else if (args.ministry) {
      return await ctx.db
        .query("services")
        .withIndex("by_ministry", (q) => q.eq("ministry", args.ministry!))
        .collect();
    } else if (args.category) {
      return await ctx.db
        .query("services")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      return await ctx.db.query("services").collect();
    }
  },
});

export const getMinistries = query({
  args: {},
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    const ministries = [...new Set(services.map(s => s.ministry))];
    return ministries.sort();
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    const categories = [...new Set(services.map(s => s.category))];
    return categories.sort();
  },
});

export const seedServices = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if services already exist
    const existingServices = await ctx.db.query("services").first();
    if (existingServices) {
      return "Services already seeded";
    }

    const sampleServices = [
      {
        name: "Passport Application",
        ministry: "Ministry of Foreign Affairs",
        category: "Immigration & Travel",
        description: "Apply for a new Sierra Leone passport for international travel",
        requirements: [
          "Birth certificate",
          "National ID card",
          "2 passport photos",
          "Completed application form",
          "Proof of citizenship"
        ],
        officialFees: "Le 500,000 (Regular) / Le 750,000 (Express)",
        processingTime: "21 working days (Regular) / 7 working days (Express)",
        locations: ["Freetown - Immigration Office", "Bo District Office", "Kenema District Office"],
        contactInfo: "+232 22 227 161",
        websiteUrl: "https://mofa.gov.sl"
      },
      {
        name: "Business Registration",
        ministry: "Ministry of Trade and Industry",
        category: "Business & Commerce",
        description: "Register a new business entity in Sierra Leone",
        requirements: [
          "Business name reservation",
          "Memorandum and Articles of Association",
          "Director identification",
          "Registered office address",
          "Share capital declaration"
        ],
        officialFees: "Le 200,000 - Le 1,000,000 (depending on capital)",
        processingTime: "5-10 working days",
        locations: ["Corporate Affairs Commission - Freetown", "Regional offices in Bo, Kenema, Makeni"],
        contactInfo: "+232 22 228 231",
        websiteUrl: "https://cac.gov.sl"
      },
      {
        name: "Driver's License",
        ministry: "Ministry of Transport and Aviation",
        category: "Transportation",
        description: "Obtain or renew a Sierra Leone driver's license",
        requirements: [
          "Valid learner's permit",
          "Medical certificate",
          "Driving test certificate",
          "2 passport photos",
          "National ID card"
        ],
        officialFees: "Le 150,000 (New) / Le 100,000 (Renewal)",
        processingTime: "Same day (if all requirements met)",
        locations: ["SLRTA Offices - Freetown, Bo, Kenema, Makeni, Port Loko"],
        contactInfo: "+232 22 224 906",
        websiteUrl: "https://slrta.gov.sl"
      },
      {
        name: "Birth Certificate",
        ministry: "Ministry of Health and Sanitation",
        category: "Civil Registration",
        description: "Register a birth and obtain official birth certificate",
        requirements: [
          "Hospital birth notification",
          "Parents' identification",
          "Marriage certificate (if applicable)",
          "Witness statements",
          "Completed registration form"
        ],
        officialFees: "Le 25,000 (Within 60 days) / Le 50,000 (After 60 days)",
        processingTime: "Same day to 3 working days",
        locations: ["All district health offices", "Registrar General's Office - Freetown"],
        contactInfo: "+232 22 222 964",
        websiteUrl: "https://mohs.gov.sl"
      },
      {
        name: "Marriage Certificate",
        ministry: "Ministry of Social Welfare",
        category: "Civil Registration",
        description: "Register a marriage and obtain official marriage certificate",
        requirements: [
          "Valid identification of both parties",
          "Birth certificates",
          "Divorce decree (if previously married)",
          "Two witnesses with ID",
          "Marriage license"
        ],
        officialFees: "Le 100,000",
        processingTime: "Same day (ceremony) + 7 days (certificate)",
        locations: ["Registrar offices in all districts", "Approved religious centers"],
        contactInfo: "+232 22 223 817",
        websiteUrl: "https://mswgca.gov.sl"
      },
      {
        name: "Tax Identification Number (TIN)",
        ministry: "National Revenue Authority",
        category: "Taxation",
        description: "Obtain a Tax Identification Number for individuals or businesses",
        requirements: [
          "National ID card or passport",
          "Proof of address",
          "Business registration (for businesses)",
          "Completed TIN application form"
        ],
        officialFees: "Free",
        processingTime: "Same day",
        locations: ["NRA offices nationwide", "Online portal"],
        contactInfo: "+232 22 229 501",
        websiteUrl: "https://nra.gov.sl"
      },
      {
        name: "Land Title Registration",
        ministry: "Ministry of Lands and Country Planning",
        category: "Land & Property",
        description: "Register land ownership and obtain official title deed",
        requirements: [
          "Survey plan",
          "Deed of conveyance",
          "Tax clearance certificate",
          "Site plan",
          "Environmental clearance"
        ],
        officialFees: "Le 500,000 - Le 2,000,000 (based on property value)",
        processingTime: "30-60 working days",
        locations: ["Lands Ministry - Freetown", "District land offices"],
        contactInfo: "+232 22 224 439",
        websiteUrl: "https://mlcp.gov.sl"
      },
      {
        name: "Import/Export License",
        ministry: "Ministry of Trade and Industry",
        category: "Business & Commerce",
        description: "Obtain license for importing or exporting goods",
        requirements: [
          "Business registration certificate",
          "Tax clearance certificate",
          "Bank reference letter",
          "Warehouse/office lease agreement",
          "Product specifications"
        ],
        officialFees: "Le 300,000 - Le 1,500,000 (depending on goods category)",
        processingTime: "14-21 working days",
        locations: ["Ministry of Trade - Freetown", "Port offices"],
        contactInfo: "+232 22 228 231"
      },
      {
        name: "Health Certificate",
        ministry: "Ministry of Health and Sanitation",
        category: "Health Services",
        description: "Obtain medical fitness certificate for employment or travel",
        requirements: [
          "Valid identification",
          "Medical examination",
          "Laboratory tests (if required)",
          "Passport photos",
          "Previous medical records"
        ],
        officialFees: "Le 75,000 - Le 150,000",
        processingTime: "1-3 working days",
        locations: ["Government hospitals", "Approved private clinics"],
        contactInfo: "+232 22 222 964"
      },
      {
        name: "Police Clearance Certificate",
        ministry: "Sierra Leone Police",
        category: "Security & Clearance",
        description: "Obtain police clearance certificate for employment or travel",
        requirements: [
          "National ID card or passport",
          "Completed application form",
          "Passport photos",
          "Fingerprints",
          "Purpose statement"
        ],
        officialFees: "Le 100,000",
        processingTime: "7-14 working days",
        locations: ["Police headquarters - Freetown", "Regional police offices"],
        contactInfo: "+232 22 226 551"
      },
      {
        name: "Work Permit (Foreign Nationals)",
        ministry: "Ministry of Labour and Social Security",
        category: "Employment & Labor",
        description: "Obtain work permit for foreign nationals seeking employment",
        requirements: [
          "Valid passport",
          "Employment contract",
          "Educational certificates",
          "Medical certificate",
          "Police clearance from home country"
        ],
        officialFees: "USD 500 - USD 2,000 (depending on category)",
        processingTime: "21-30 working days",
        locations: ["Ministry of Labour - Freetown"],
        contactInfo: "+232 22 224 722"
      },
      {
        name: "Environmental Impact Assessment",
        ministry: "Ministry of Environment",
        category: "Environment & Planning",
        description: "Conduct environmental assessment for development projects",
        requirements: [
          "Project proposal",
          "Site survey report",
          "Technical drawings",
          "Community consultation report",
          "Mitigation measures plan"
        ],
        officialFees: "Le 2,000,000 - Le 10,000,000 (project dependent)",
        processingTime: "45-90 working days",
        locations: ["Environment Ministry - Freetown", "Regional offices"],
        contactInfo: "+232 22 226 910"
      },
      {
        name: "Mining License",
        ministry: "Ministry of Mineral Resources",
        category: "Mining & Resources",
        description: "Obtain license for mineral exploration or mining operations",
        requirements: [
          "Geological survey report",
          "Environmental management plan",
          "Financial capability proof",
          "Technical expertise evidence",
          "Community agreement"
        ],
        officialFees: "USD 1,000 - USD 50,000 (depending on scale)",
        processingTime: "60-120 working days",
        locations: ["Mineral Resources Ministry - Freetown"],
        contactInfo: "+232 22 224 750"
      },
      {
        name: "School Certificate Verification",
        ministry: "Ministry of Basic and Senior Secondary Education",
        category: "Education",
        description: "Verify and authenticate educational certificates",
        requirements: [
          "Original certificates",
          "Completed verification form",
          "Valid identification",
          "Passport photos",
          "School transcripts"
        ],
        officialFees: "Le 50,000 per certificate",
        processingTime: "5-10 working days",
        locations: ["Education Ministry - Freetown", "Regional education offices"],
        contactInfo: "+232 22 224 439"
      },
      {
        name: "Fishing License",
        ministry: "Ministry of Fisheries and Marine Resources",
        category: "Agriculture & Fisheries",
        description: "Obtain license for commercial or artisanal fishing",
        requirements: [
          "Vessel registration",
          "Fishing gear specifications",
          "Captain's license",
          "Insurance certificate",
          "Safety equipment list"
        ],
        officialFees: "Le 200,000 - Le 2,000,000 (vessel dependent)",
        processingTime: "14-21 working days",
        locations: ["Fisheries Ministry - Freetown", "Coastal district offices"],
        contactInfo: "+232 22 224 085"
      },
      {
        name: "Tourism Business License",
        ministry: "Ministry of Tourism and Cultural Affairs",
        category: "Tourism & Culture",
        description: "Register and license tourism-related businesses",
        requirements: [
          "Business registration certificate",
          "Facility inspection report",
          "Staff training certificates",
          "Insurance coverage",
          "Safety compliance certificate"
        ],
        officialFees: "Le 500,000 - Le 3,000,000 (facility dependent)",
        processingTime: "21-30 working days",
        locations: ["Tourism Ministry - Freetown", "Tourist board offices"],
        contactInfo: "+232 22 228 621"
      },
      {
        name: "Water Connection Permit",
        ministry: "Ministry of Water Resources",
        category: "Utilities & Infrastructure",
        description: "Apply for new water connection or upgrade existing service",
        requirements: [
          "Property ownership proof",
          "Site plan",
          "Plumbing specifications",
          "Environmental clearance",
          "Payment of connection fees"
        ],
        officialFees: "Le 300,000 - Le 1,500,000 (connection type dependent)",
        processingTime: "14-30 working days",
        locations: ["Guma Valley Water Company", "District water offices"],
        contactInfo: "+232 22 224 067"
      },
      {
        name: "Electricity Connection",
        ministry: "Ministry of Energy",
        category: "Utilities & Infrastructure",
        description: "Apply for new electricity connection or service upgrade",
        requirements: [
          "Property ownership documents",
          "Electrical installation certificate",
          "Load assessment report",
          "Safety inspection",
          "Connection fee payment"
        ],
        officialFees: "Le 500,000 - Le 2,500,000 (load dependent)",
        processingTime: "21-45 working days",
        locations: ["EDSA offices nationwide"],
        contactInfo: "+232 22 224 012"
      },
      {
        name: "Pharmacy License",
        ministry: "Ministry of Health and Sanitation",
        category: "Health Services",
        description: "License to operate a pharmacy or pharmaceutical business",
        requirements: [
          "Pharmacy degree certificate",
          "Professional registration",
          "Premises inspection report",
          "Drug storage facilities",
          "Qualified pharmacist employment"
        ],
        officialFees: "Le 1,000,000 - Le 3,000,000",
        processingTime: "30-45 working days",
        locations: ["Pharmacy Board - Freetown", "Regional health offices"],
        contactInfo: "+232 22 222 964"
      },
      {
        name: "Cooperative Society Registration",
        ministry: "Ministry of Agriculture and Food Security",
        category: "Agriculture & Cooperatives",
        description: "Register agricultural or community cooperative society",
        requirements: [
          "Constitution and bylaws",
          "Member registration list",
          "Financial plan",
          "Leadership structure",
          "Community endorsement"
        ],
        officialFees: "Le 100,000",
        processingTime: "14-21 working days",
        locations: ["Agriculture Ministry - Freetown", "District agricultural offices"],
        contactInfo: "+232 22 226 540"
      }
    ];

    for (const service of sampleServices) {
      await ctx.db.insert("services", service);
    }

    return "Services seeded successfully";
  },
});
