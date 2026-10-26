/* What an image does on a Work page, written beside the image in the
   project's YAML (`role:` on a multiImage, leadFigures or views entry).
   main goes in the intro slider and the listing scrub; the rest build the
   drawings article under it. An image with no role is a detail. */
export const MEDIA_ROLES = ['main', 'plan', 'illustration', 'section', 'detail', 'making'] as const;
export type MediaRole = typeof MEDIA_ROLES[number];
