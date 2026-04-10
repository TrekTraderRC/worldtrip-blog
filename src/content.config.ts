import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const travel = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/travel',
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    country: z.string(),
    countryCode: z.string().length(2).optional(),
    region: z.string(),
    icon: z.string().optional(),
    date: z.coerce.date(),
    publishedAt: z.coerce.date().optional(),
    tier: z.enum(['free', 'paid']),
    summary: z.string(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    order: z.number().default(1),
  }),
});

export const collections = {
  travel,
};