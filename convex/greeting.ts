import { action } from "./_generated/server";
import { v } from "convex/values";

export const getGreeting = action({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    return `Welcome back ${name}`;
  },
});
