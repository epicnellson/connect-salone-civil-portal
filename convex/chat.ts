import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get AI response using Convex OpenAI integration
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      baseURL: process.env.CONVEX_OPENAI_BASE_URL,
      apiKey: process.env.CONVEX_OPENAI_API_KEY,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: `You are Connect Salone AI, an intelligent assistant for Sierra Leone government services. You help citizens navigate government processes, find information about services, fees, requirements, and contact details.

Key guidelines:
- Provide accurate information about Sierra Leone government services
- Always mention official fees, processing times, and required documents when known
- Direct users to appropriate ministries and offices
- Be helpful, professional, and culturally sensitive
- If you don't have specific information, suggest contacting the relevant ministry
- Use simple, clear language accessible to all education levels
- Include contact information when available

Available services include passport applications, business registration, driver's licenses, birth certificates, marriage certificates, tax registration, land titles, import/export licenses, health certificates, police clearances, work permits, and many others across various ministries.`
          },
          {
            role: "user",
            content: args.message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I apologize, but I'm having trouble processing your request right now. Please try again or contact the relevant ministry directly.";

      // Save the conversation
      await ctx.runMutation(api.chat.saveMessage, {
        message: args.message,
        response: aiResponse,
        sessionId: args.sessionId,
      });

      return aiResponse;
    } catch (error) {
      console.error("OpenAI API error:", error);
      const fallbackResponse = "I apologize, but I'm having trouble processing your request right now. Please try again or contact the relevant ministry directly.";
      
      // Save the conversation with fallback response
      await ctx.runMutation(api.chat.saveMessage, {
        message: args.message,
        response: fallbackResponse,
        sessionId: args.sessionId,
      });

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
