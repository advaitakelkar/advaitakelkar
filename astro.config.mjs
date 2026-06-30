import { defineConfig } from 'astro/config';

// Keystatic admin UI is available in dev mode only.
// In production (astro build), site is fully static → Firebase-deployable.
const isDev = process.argv.includes('dev');

const integrations = [];

if (isDev) {
  const { default: keystatic } = await import('@keystatic/astro');
  integrations.push(keystatic());
}

export default defineConfig({
  integrations,
  // Canonical brand domain (Porkbun → Firebase). Drives <link rel="canonical">,
  // OG URLs and the sitemap, so search engines index the name, not the *.web.app.
  site: 'https://advaitakelkar.com',
});
