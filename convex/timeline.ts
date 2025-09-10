//mutation and create function
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTimeline = mutation({
  args: {
    // timeline details
    caseName: v.string(),
    areaOfLaw: v.string(),

    // Files information (already uploaded to EdgeStore)
    files: v.array(
      v.object({
        fileName: v.string(),
        url: v.string(),
        size: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // 1. Create the timeline
    const timelineId = await ctx.db.insert("timeline", {
      caseName: args.caseName,
      areaOfLaw: args.areaOfLaw,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    for (const file of args.files) {
        await ctx.db.insert("file", {
        ...file,
        timelineId: timelineId,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // Return all the created data
    return {
      timelineId,
    };
  },
});

export const getTimeline = query({
  args: {

  },
 handler: async (ctx) => {
    // Query all timelines
    // Sorted by creation date (newest first)
    const timelines = await ctx.db.query("timeline").order("desc").collect();

    // For each timeline, fetch its related files
    const timelinesWithFiles = await Promise.all(
      timelines.map(async (timeline) => {
        // Get files related to this timeline
        const files = await ctx.db
          .query("file")
          .filter((q) => q.eq(q.field("timelineId"), timeline._id))
          .collect();

        // Return timeline with its files
        return {
          ...timeline,
          files,
        };
      })
    );

    // Return the timelines with their files
    return timelinesWithFiles;
  },
});