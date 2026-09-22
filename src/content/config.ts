import { defineCollection, z, reference } from 'astro:content';

// The discipline axis — WHAT a project is (Architecture, Interior, Research…).
// Mirrors the `Type` property in the Notion Projects database, one per project.
// Studios do NOT belong here; they are the `studios` collection below. Keeping
// both in this one list is what grew the filter bar to 17 entries, half of
// which answered a different question from the other half.
const tags = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
  }),
});

// The studio axis — WHO the work was made with. A second level under
// `category`, never a peer of it: Notion stores exactly this as the second
// value of its `Category` multi-select, e.g. ["🏢 Work", "FKD"].
const studios = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    displayName: z.string(),
    // Tab label where the full name will not fit. Spelled out rather than
    // sliced from displayName, which produced "F'K" and "STU".
    shortName: z.string().optional(),
    // The bucket this studio sits under, so /work/<studio> can be derived.
    category: reference('categories'),
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
    // Image used for og:image / social link previews on this category page.
    // Falls back to the site-wide portrait in Base.astro when omitted.
    shareImage: z.string().optional(),
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
    // 'ai-works' and 'project-01' are the written names for `cards` and
    // `renders`. See projectTemplates.ts.
    template: z.enum(['auto', 'tabs', 'cards', 'ai-works', 'chapters', 'renders', 'project-01']).optional(),
    design: z.string().optional(),
    making: z.string().optional(),
    smallIntro: z.string().optional(),
    description: z.any().optional(),
    collaborator: z.string().optional(),
    program: z.string().optional(),
    coverImage: z.string().optional(),
    multiImage: z.array(z.string()).optional(),
    // If set, the project-list scrub draws from these instead of all images
    // (e.g. renders only, no sketches). The project page still shows everything.
    scrubImages: z.array(z.string()).optional(),
    /* Project Template 01 only, desktop only: one fixed picture beside the
       copy. It never changes and it is not part of the rail — the rail is the
       work and it moves; this is a still to read the text against. Defaults
       to nothing, so a project without one simply keeps the full-width copy. */
    sideImage: z.string().optional(),
    /* Same slot, moving. When set, the still is played instead of shown, and
       `sideImage` becomes its poster — so a project declares one or the other
       picture and never two competing ones. Muted and looping, because it
       sits beside the copy as a texture rather than as something to watch;
       anything that needs sound is a film and belongs in the rail. */
    sideVideo: z.string().optional(),
    /* How an AI project was actually made, as data rather than prose. One
       entry per RUN: several projects were generated more than once — Alt
       Verse exists as a Midjourney set and again as a local SDXL regen — and
       the page names all of them rather than picking the latest.

       `where` is the part that is hard to find out afterwards and easy to
       state: 'local' is Adi's own machine, 'cloud' is a hosted service, and
       'hybrid' is a project whose runs were split across both. */
    pipeline: z.array(z.object({
      // TXT2IMG, IMG2IMG, IMG2TEXT — what the run turned into what.
      kind: z.string(),
      // What the run WROTE. The masters are PNG throughout; the site serves
      // webp, which is a publishing decision and not part of the pipeline.
      ext: z.string().optional(),
      model: z.string(),
      // The family underneath, where the model name does not say it: SDXL,
      // FLUX.2. Omitted for a hosted model that is its own family.
      base: z.string().optional(),
      // Render size, not the web-sized file in public/.
      size: z.string().optional(),
      where: z.enum(['local', 'cloud', 'hybrid']),
      // What it was driven with — ComfyUI, Discord. Omitted when obvious.
      tool: z.string().optional(),
      // Sampler, steps, upscales. The part the fold opens to.
      detail: z.string().optional(),
    })).optional(),
    /* Project Template 01 only: how the groups behind `views` are chosen
       between. 'tabs' is a row of pills and suits a flat with eight rooms;
       'chapters' is a numbered column of dropdowns and suits a study read in
       order. Same data, different control. Defaults to tabs. */
    groups: z.enum(['tabs', 'chapters']).optional(),
    /* ── Views, for a project that is renders rather than photographs ──────
       A rendering project does not have N images; it has N VIEWS, and each
       view was rendered several times. Those alternates are variations of one
       picture, not more pictures — listing them flat made XBKC read as 51
       works when it is thirteen.

       So a view carries its chosen image and the variations behind it. The
       deck shows the chosen ones, one per view, and a card shows the cover
       alone: a thumbnail strip of the same room six times says nothing. */
    views: z.array(z.object({
      // The room this view is of. The renders template makes one tab per
      // room, in the order the rooms first appear here.
      room: z.string().optional(),
      label: z.string().optional(),
      image: z.string(),
      variations: z.array(z.string()).optional(),
    })).optional(),
    // Team members shown as avatar circles + names on the project page.
    // Names must match the PEOPLE registry in projects/[slug].astro.
    // Defaults to Advaita only when omitted.
    people: z.array(z.string()).optional(),
    // Names from `people` who act as professor/mentor ON THIS PROJECT — they
    // sit left of the divider. Augments the global always-professor list
    // (Samir, Faizan, Siddhesh, and the SCAD professors).
    professors: z.array(z.string()).optional(),
    // Long-form chapter dropdowns rendered below the summary on the project
    // page (replaces the Design/Making sections). body is raw HTML.
    chapters: z.array(z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      body: z.string(),
    })).optional(),
    // Download pills (e.g. Summary / Book PDFs) shown under the summary. Each
    // pill only renders once its file exists in public/ (publicFileExists).
    downloads: z.array(z.object({
      label: z.string(),
      href: z.string(),
    })).optional(),
    // Discipline — one per project. Array kept for backwards compatibility
    // with existing consumers, but the taxonomy is now single-valued.
    tags: z.array(reference('tags')).optional(),
    category: reference('categories').optional(),
    // Which studio the work was made with, within that category.
    studio: reference('studios').optional(),
  }),
});

// Interactive exhibitions (currently only Virtual Gods). The wheel, the
// quadrant rooms and the pair rooms all render from this one file — asset
// slugs here map to public/images/virtual-gods/vg/ (built by
// scripts/build-vg-assets.sh). An empty `module` means that participant's
// individual GIF was never archived; the UI degrades to name + architect.
const exhibitionMember = z.object({
  name: z.string(),
  module: z.string().default(''),
  architect: z.string(),
});

const exhibitionPair = z.object({
  slug: z.string(),
  label: z.string(),
  film: z.string().default(''),
  members: z.array(exhibitionMember),
});

const exhibitions = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    year: z.string().optional(),
    tagline: z.string().optional(),
    intro: z.array(z.string()).optional(),
    quadrants: z.array(z.object({
      slug: z.string(),
      position: z.enum(['tl', 'tr', 'bl', 'br']),
      color: z.string(),
      label: z.string(),
      architects: z.array(z.string()),
      film: z.string().default(''),
      methodology: z.array(z.string()).optional(),
      renders: z.array(z.string()).optional(),
      pairs: z.array(exhibitionPair),
    })),
  }),
});

export const collections = { projects, tags, categories, studios, pages, exhibitions };
