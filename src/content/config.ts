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
    // Editable copy for the category archive page (inline edit mode writes here).
    tagline: z.string().optional(),
    intro: z.array(z.string()).optional(),
  }),
});

// Editable prose for the static pages (home, about). Inline edit mode writes
// these YAML files; the pages render from them instead of hard-coded strings.
const pages = defineCollection({
  type: 'data',
  schema: z.object({
    tagline: z.string().optional(),
    intro: z.array(z.string()).optional(),
    role: z.string().optional(),
    degree: z.string().optional(),
    bioLead: z.string().optional(),
    bioMore: z.array(z.string()).optional(),
    careerTagline: z.string().optional(),
    skillsetSubtitle: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    shortName: z.string().optional(),
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
    // If set, the project-list scrub draws from these instead of all images
    // (e.g. renders only, no sketches). The project page still shows everything.
    scrubImages: z.array(z.string()).optional(),
    // Team members shown as avatar circles + names on the project page.
    // Names must match the PEOPLE registry in projects/[slug].astro.
    // Defaults to Advaita only when omitted.
    people: z.array(z.string()).optional(),
    // Long-form chapter dropdowns rendered below the summary on the project
    // page (replaces the Design/Making sections). body is raw HTML.
    chapters: z.array(z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      body: z.string(),
    })).optional(),
    tags: z.array(reference('tags')).optional(),
    category: reference('categories').optional(),
  }),
});

export const collections = { projects, tags, categories, pages };
