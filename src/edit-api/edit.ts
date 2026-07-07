import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

// Dev-only — this route is injected by astro.config.mjs only when running
// `astro dev`, so it never ships to the static production build.
export const prerender = false;

const ROOT = process.cwd();

const DIRS: Record<string, string> = {
  projects: 'src/content/projects',
  categories: 'src/content/categories',
  pages: 'src/content/pages',
};

// Only these fields may be written, per collection — guards against a stray
// binding rewriting something it shouldn't.
const ALLOW: Record<string, string[]> = {
  projects: ['name', 'shortName', 'smallIntro', 'description', 'year', 'client', 'location', 'status', 'program', 'collaborator'],
  categories: ['tagline', 'intro'],
  pages: ['tagline', 'intro', 'role', 'degree', 'bioLead', 'bioMore', 'careerTagline', 'skillsetSubtitle'],
};

const ID_RE = /^[a-z0-9-]+$/;

function bad(error: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let payload: { path?: unknown; value?: unknown };
  try {
    payload = await request.json();
  } catch {
    return bad('invalid JSON');
  }

  const editPath = payload.path;
  const value = payload.value;
  if (typeof editPath !== 'string' || typeof value !== 'string') return bad('path and value must be strings');

  const [collection, id, fieldPath] = editPath.split('/');
  const dir = DIRS[collection];
  if (!dir) return bad('unknown collection');
  if (!id || !ID_RE.test(id)) return bad('invalid id');

  const [field, idxStr] = (fieldPath ?? '').split('.');
  if (!field || !ALLOW[collection].includes(field)) return bad('field not allowed');

  const file = path.join(ROOT, dir, `${id}.yaml`);

  let data: Record<string, any>;
  try {
    data = (yaml.load(await fs.readFile(file, 'utf8')) as Record<string, any>) ?? {};
  } catch {
    return bad('content file not found', 404);
  }

  if (idxStr !== undefined && idxStr !== '') {
    const i = Number(idxStr);
    if (!Number.isInteger(i) || i < 0) return bad('invalid array index');
    if (!Array.isArray(data[field])) data[field] = [];
    data[field][i] = value;
  } else {
    data[field] = value;
  }

  try {
    const out = yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"', forceQuotes: false });
    await fs.writeFile(file, out, 'utf8');
  } catch (e: any) {
    return bad(e?.message ?? 'write failed', 500);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
