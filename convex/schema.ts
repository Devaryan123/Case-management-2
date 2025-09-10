import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  timeline: defineTable({
    caseName: v.string(),
    areaOfLaw: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  file: defineTable({
    size: v.string(),
    fileName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    url: v.string(),
    timelineId: v.id("timeline"), //relation
  }),
});
