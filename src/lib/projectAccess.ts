// Shared by the gate, listings, homepage and sitemap. Unlock only reviewed projects.
export const PUBLIC_PROJECT_SLUGS = ['alt-verse','architect-x-architects','carlo','concrt','deleuze-guattari','dhal-ni-pol','shelf','future-of-dance','hanma-fam','human-pods','indian-royals','sups-cards','sups-in-the-hinterland','xbkc'] as const;
export function isPublicProject(slug: string): boolean { return (PUBLIC_PROJECT_SLUGS as readonly string[]).includes(slug); }
