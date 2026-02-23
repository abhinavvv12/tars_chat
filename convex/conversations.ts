import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.userId1 === args.userId2) {
      throw new Error("Cannot chat with yourself");
    }

    // 🔥 SORT IDS — THIS IS CRITICAL
    const [a, b] =
      args.userId1 < args.userId2
        ? [args.userId1, args.userId2]
        : [args.userId2, args.userId1];

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_users", (q) =>
        q.eq("userId1", a).eq("userId2", b)
      )
      .first();

    if (existing) return existing;

    const id = await ctx.db.insert("conversations", {
      userId1: a,
      userId2: b,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});