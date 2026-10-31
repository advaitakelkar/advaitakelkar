#!/usr/bin/env node
// Catch schema drift before an editor upgrade makes existing entries unreadable.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import { createReader } from '@keystatic/core/reader';
import config from '../keystatic.config.ts';

const reader = createReader(process.cwd(), config);
let checked = 0;
for (const [name, collection] of Object.entries(reader.collections)) {
  const slugs = await collection.list();
  assert.ok(slugs.length, `No entries found in ${name}`);
  for (const slug of slugs) {
    await collection.readOrThrow(slug);
    const data = yaml.load(await fs.readFile(`src/content/${name}/${slug}.yaml`, 'utf8'));
    for (const [key, field] of Object.entries(config.collections[name].schema)) {
      if (field.kind === 'form' && field.label === 'Ignored') {
        assert.deepEqual(field.serialize(field.parse(data[key])).value, data[key],
          `${name}/${slug}: ${key} must survive editing unchanged`);
      }
    }
    checked++;
  }
}
console.log(`✓ ${checked} editor entries parse; structured presentation data round-trips unchanged`);
