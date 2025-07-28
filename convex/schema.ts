import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    // You can add more user fields here
  }),
  userPreferences: defineTable({
    userId: v.id('users'),
    language: v.optional(v.string()),
    tide: v.optional(v.string()),
    temperature: v.optional(v.string()),
    wind: v.optional(v.string()),
    waveHeight: v.optional(v.string()),
    theme: v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    // Add more preference fields as needed
  }).index('userId', ['userId']),
})
