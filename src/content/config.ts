import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    pubDate: z.string(),
    readTime: z.string(),
    tags: z.array(z.string()),
    headerGradient: z.string(),
    accentColor: z.string(),
    calloutBg: z.string(),
  }),
});

export const collections = { blog };
