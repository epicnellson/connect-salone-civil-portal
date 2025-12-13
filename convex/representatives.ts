import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const searchRepresentatives = query({
  args: {
    searchTerm: v.optional(v.string()),
    district: v.optional(v.string()),
    ministry: v.optional(v.string()),
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
          if (args.ministry) {
            searchQuery = searchQuery.eq("ministry", args.ministry);
          }
          return searchQuery;
        })
        .collect();
    } else if (args.district) {
      return await ctx.db
        .query("representatives")
        .withIndex("by_district", (q) => q.eq("district", args.district!))
        .collect();
    } else if (args.ministry) {
      return await ctx.db
        .query("representatives")
        .withIndex("by_ministry", (q) => q.eq("ministry", args.ministry!))
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
    const districts = [...new Set(representatives.map(r => r.district))];
    return districts.sort();
  },
});

export const seedRepresentatives = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if representatives already exist
    const existingReps = await ctx.db.query("representatives").first();
    if (existingReps) {
      return "Representatives already seeded";
    }

    const sampleRepresentatives = [
      {
        name: "Dr. Alie Kabba",
        title: "Minister",
        ministry: "Ministry of Foreign Affairs",
        district: "Western Area",
        phone: "+232 22 227 161",
        email: "minister@mofa.gov.sl",
        office: "Minister's Office",
        officeAddress: "Tower Hill, Freetown"
      },
      {
        name: "Edward Hinga Sandy",
        title: "Minister",
        ministry: "Ministry of Trade and Industry",
        district: "Western Area",
        phone: "+232 22 228 231",
        email: "minister@mti.gov.sl",
        office: "Minister's Office",
        officeAddress: "Youyi Building, Freetown"
      },
      {
        name: "Fanday Turay",
        title: "Minister",
        ministry: "Ministry of Transport and Aviation",
        district: "Western Area",
        phone: "+232 22 224 906",
        email: "minister@mta.gov.sl",
        office: "Minister's Office",
        officeAddress: "New England, Freetown"
      },
      {
        name: "Austin Demby",
        title: "Minister",
        ministry: "Ministry of Health and Sanitation",
        district: "Western Area",
        phone: "+232 22 222 964",
        email: "minister@mohs.gov.sl",
        office: "Minister's Office",
        officeAddress: "Youyi Building, Freetown"
      },
      {
        name: "Mohamed Orman Bangura",
        title: "Commissioner General",
        ministry: "National Revenue Authority",
        district: "Western Area",
        phone: "+232 22 229 501",
        email: "cg@nra.gov.sl",
        office: "NRA Headquarters",
        officeAddress: "Guma Building, Lamina Sankoh Street, Freetown"
      },
      {
        name: "Brima Baluwa Koroma",
        title: "Minister",
        ministry: "Ministry of Lands and Country Planning",
        district: "Western Area",
        phone: "+232 22 224 439",
        email: "minister@mlcp.gov.sl",
        office: "Minister's Office",
        officeAddress: "Ministerial Building, George Street, Freetown"
      },
      {
        name: "Mohamed Alie Vandi",
        title: "District Officer",
        ministry: "Ministry of Local Government",
        district: "Bo District",
        phone: "+232 32 270 045",
        email: "do.bo@mlgrd.gov.sl",
        office: "District Council Office",
        officeAddress: "Bo Government Hospital Road, Bo"
      },
      {
        name: "Isata Mahoi",
        title: "District Officer",
        ministry: "Ministry of Local Government",
        district: "Kenema District",
        phone: "+232 32 266 201",
        email: "do.kenema@mlgrd.gov.sl",
        office: "District Council Office",
        officeAddress: "Hangha Road, Kenema"
      },
      {
        name: "Abu Bakarr Fofana",
        title: "District Officer",
        ministry: "Ministry of Local Government",
        district: "Makeni District",
        phone: "+232 32 270 123",
        email: "do.makeni@mlgrd.gov.sl",
        office: "District Council Office",
        officeAddress: "Magburaka Road, Makeni"
      },
      {
        name: "Fatmata Sorie",
        title: "Regional Education Officer",
        ministry: "Ministry of Basic and Senior Secondary Education",
        district: "Northern Province",
        phone: "+232 32 270 089",
        email: "reo.north@mbsse.gov.sl",
        office: "Regional Education Office",
        officeAddress: "Education Complex, Makeni"
      },
      {
        name: "James Momoh Conteh",
        title: "Regional Health Officer",
        ministry: "Ministry of Health and Sanitation",
        district: "Eastern Province",
        phone: "+232 32 266 445",
        email: "rho.east@mohs.gov.sl",
        office: "Regional Health Office",
        officeAddress: "Government Hospital, Kenema"
      },
      {
        name: "Aminata Koroma",
        title: "District Agricultural Officer",
        ministry: "Ministry of Agriculture and Food Security",
        district: "Port Loko District",
        phone: "+232 32 270 567",
        email: "dao.portloko@mafs.gov.sl",
        office: "District Agricultural Office",
        officeAddress: "Agricultural Complex, Port Loko"
      },
      {
        name: "Inspector General William Fayia Sellu",
        title: "Inspector General",
        ministry: "Sierra Leone Police",
        district: "Western Area",
        phone: "+232 22 226 551",
        email: "ig@police.gov.sl",
        office: "Police Headquarters",
        officeAddress: "George Street, Freetown"
      },
      {
        name: "Mohamed Lamin Tarawally",
        title: "Regional Police Commander",
        ministry: "Sierra Leone Police",
        district: "Southern Province",
        phone: "+232 32 270 234",
        email: "rpc.south@police.gov.sl",
        office: "Regional Police Headquarters",
        officeAddress: "Police Barracks, Bo"
      },
      {
        name: "Kadijah Sesay",
        title: "District Social Welfare Officer",
        ministry: "Ministry of Social Welfare",
        district: "Kailahun District",
        phone: "+232 32 266 789",
        email: "dswo.kailahun@mswgca.gov.sl",
        office: "District Social Welfare Office",
        officeAddress: "Government Building, Kailahun"
      }
    ];

    for (const representative of sampleRepresentatives) {
      await ctx.db.insert("representatives", representative);
    }

    return "Representatives seeded successfully";
  },
});
