// Shared by the gate, listings, homepage and sitemap. Unlock only reviewed projects.
export const PUBLIC_PROJECT_SLUGS = ['alt-verse','architect-x-architects','carlo','concrt','deleuze-guattari','shelf','hanma-fam','indian-royals','space-pirates','sups-cards','sups-in-the-hinterland','xbkc'] as const;
export function isPublicProject(slug: string): boolean { return (PUBLIC_PROJECT_SLUGS as readonly string[]).includes(slug); }
