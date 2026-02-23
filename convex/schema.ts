import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    userId1: v.id("users"),
    userId2: v.id("users"),
    createdAt: v.number(),
  }).index("by_users", ["userId1", "userId2"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});