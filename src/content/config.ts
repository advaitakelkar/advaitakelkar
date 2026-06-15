import { defineCollection, z, reference } from 'astro:content';

const tags = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
  }),
});

const categories = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    displayName: z.string(),
  }),
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    numbr: z.number().optional(),
    year: z.string().optional(),
    client: z.string().optional(),
    size: z.string().optional(),
    location: z.string().optional(),
    status: z.string().optional(),
    featured: z.boolean().default(false),
    passcode: z.string().optional(),
    smallIntro: z.string().optional(),
    description: z.any().optional(),
    collaborator: z.string().optional(),
    program: z.string().optional(),
    coverImage: z.string().optional(),
    multiImage: z.array(z.string()).optional(),
    tags: z.array(reference('tags')).optional(),
    category: reference('categories').optional(),
  }),
});

export const collections = { projects, tags, categories };
