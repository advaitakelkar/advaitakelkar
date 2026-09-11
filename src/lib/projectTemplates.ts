export type ProjectTemplate = 'auto' | 'tabs' | 'cards' | 'chapters';
const cardProjects = new Set(['alt-verse','architect-x-architects','future-of-dance','indian-royals','sups-cards','sups-in-the-hinterland','human-pods']);
const tabProjects = new Set(['carlo','concrt','goonj','nat-geo-humans','pet-pod','roberto-burle-marx-stickers','shelf','tilak-nagar-cricket-park','xbkc']);
export function projectTemplate(slug: string, category?: string, template?: ProjectTemplate) {
 if (template === 'auto') template = undefined;
 const cards = template ? template === 'cards' : cardProjects.has(slug);
 const chapters = template ? template === 'chapters' : ['habersham-hall','scad-design-built'].includes(slug);
 const tabs = template ? template !== 'cards' : ['work','archv','academic'].includes(category ?? '') || chapters || tabProjects.has(slug) || slug === 'scarpin';
 return { cards, chapters, tabs, cardLayout: !!template || cards || tabs || category === 'freelancer' };
}
