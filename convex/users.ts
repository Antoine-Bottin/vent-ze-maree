import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const saveUser = mutation({
  args: { id: v.string(), email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('users', {
      id: args.id,
      name: args.name,
      email: args.email,
    })
  },
})
