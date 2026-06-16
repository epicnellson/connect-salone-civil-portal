import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Fallback responses when OpenAI is not available
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();

  // Common greetings
  if (
    lowerMessage === "hy" ||
    lowerMessage === "hi" ||
    lowerMessage === "hello"
  ) {
    return "Hello! I'm here to help you with Sierra Leone government services. How can I assist you today?";
  }

  // Service-related queries
  if (lowerMessage.includes("passport") || lowerMessage.includes("travel")) {
    return "For passport services, you'll need to visit the Immigration Office in Freetown. Required documents typically include: birth certificate, national ID, passport photos, and completed application forms. Processing time is usually 2-4 weeks.";
  }

  if (lowerMessage.includes("driver") || lowerMessage.includes("license")) {
    return "Driver's licenses are issued by the Road Transport Authority. You'll need to complete an application, provide identification, pass a vision test, and complete both written and practical driving tests.";
  }

  if (lowerMessage.includes("business") || lowerMessage.includes("register")) {
    return "Business registration is handled by the Ministry of Trade and Industry. You'll need to submit business name, address, ownership details, and pay the registration fee. Processing typically takes 5-10 business days.";
  }

  if (lowerMessage.includes("birth") || lowerMessage.includes("certificate")) {
    return "Birth certificates are issued by the National Civil Registration Authority. Required documents include: proof of birth, parents' ID documents, and completed application form. Processing time is usually 1-2 weeks.";
  }

  // List of services query
  if (
    lowerMessage.includes("list") ||
    lowerMessage.includes("services") ||
    lowerMessage.includes("available")
  ) {
    return `Here are the main Sierra Leone government services available:

🏛️ **Immigration Services:**
- Passport applications and renewals
- Visa processing
- Work permits
- Residence permits

🚗 **Transport Services:**
- Driver's license applications
- Vehicle registration
- Road tax payments

📋 **Civil Registration:**
- Birth certificates
- Marriage certificates
- Death certificates
- National ID cards

💼 **Business & Trade:**
- Business registration
- Trade licenses
- Import/export permits
- Tax registration

🏥 **Health Services:**
- Health certificates
- Medical licenses
- Public health services

🏛️ **Other Services:**
- Police clearances
- Land title registration
- Educational certificates
- Social welfare services

For specific requirements, fees, and processing times, please visit the relevant ministry office or check our Service Directory.`;
  }

  // Default fallback
  return "I'm currently experiencing technical difficulties. For specific service information, please contact the relevant government ministry directly, or visit their office in person. You can find contact details in our Service Directory.";
}

export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Rate limiting: max 20 messages per minute per session
    const recentMessages = await ctx.runQuery(api.chat.getRecentMessages, {
      sessionId: args.sessionId,
      since: Date.now() - 60000,
    });
    if (recentMessages.length >= 20) {
      throw new Error("You've reached the message limit. Please wait a moment before sending more messages.");
    }

    // Get AI response using Groq (free alternative to OpenAI)
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
    });

    try {
      // Check for specific greeting pattern
      if (
        args.message.toLowerCase().trim() === "hy" ||
        args.message.toLowerCase().trim() === "hi"
      ) {
        const greetingResponse = "Hello! How can I help you with Sierra Leone government services today?";

        // Save the conversation
        await ctx.runMutation(api.chat.saveMessage, {
          message: args.message,
          response: greetingResponse,
          sessionId: args.sessionId,
        });

        return greetingResponse;
      }

      const completion = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are SaloneHub AI, an intelligent assistant for Sierra Leone government services. You help citizens navigate government processes, find information about services, fees, requirements, and contact details.

Key guidelines:
- Provide accurate information about Sierra Leone government services
- Always mention official fees, processing times, and required documents when known
- Direct users to appropriate ministries and offices
- Be helpful, professional, and culturally sensitive
- If you don't have specific information, suggest contacting the relevant ministry
- Use simple, clear language accessible to all education levels
- Include contact information when available

Available services include passport applications, business registration, driver's licenses, birth certificates, marriage certificates, tax registration, land titles, import/export licenses, health certificates, police clearances, work permits, and many others across various ministries.`,
          },
          {
            role: "user",
            content: args.message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "I apologize, but I'm having trouble processing your request right now. Please try again or contact the relevant ministry directly.";

      console.log("DEBUG: OpenAI responded successfully");

      // Save the conversation
      await ctx.runMutation(api.chat.saveMessage, {
        message: args.message,
        response: aiResponse,
        sessionId: args.sessionId,
      });

      return aiResponse;
    } catch (error: any) {
      const errorMessage = error?.message || String(error);

      // Check if it's an OpenAI quota/credit issue
      if (
        errorMessage.includes("no requests remaining") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("401")
      ) {
        const fallbackResponse =
          "I'm currently experiencing technical difficulties with the AI service. Please try again later or contact the relevant government ministry directly for assistance with your inquiry.";

        await ctx.runMutation(api.chat.saveMessage, {
          message: args.message,
          response: fallbackResponse,
          sessionId: args.sessionId,
        });

        return fallbackResponse;
      }

      const fallbackResponse = getFallbackResponse(args.message);

      // Save the conversation with fallback response
      try {
        await ctx.runMutation(api.chat.saveMessage, {
          message: args.message,
          response: fallbackResponse,
          sessionId: args.sessionId,
        });
      } catch (saveError) {
        console.error("DEBUG: Failed to save fallback message:", saveError);
      }

      return fallbackResponse;
    }
  },
});

export const saveMessage = mutation({
  args: {
    message: v.string(),
    response: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    await ctx.db.insert("chatMessages", {
      userId: userId || undefined,
      sessionId: args.sessionId,
      message: args.message,
      response: args.response,
      timestamp: Date.now(),
    });
  },
});

export const getChatHistory = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const getRecentMessages = query({
  args: { sessionId: v.string(), since: v.number() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
    return messages.filter((m) => m.timestamp >= args.since);
  },
});
