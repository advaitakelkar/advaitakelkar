import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Keystatic admin UI is available in dev mode only.
// In production (astro build), site is fully static → Firebase-deployable.
const isDev = process.argv.includes('dev');

const integrations = [mdx()];

if (isDev) {
  const { default: keystatic } = await import('@keystatic/astro');
  integrations.push(keystatic());
}

export default defineConfig({
  integrations,
  site: 'https://advaitakelkar.com',
});
