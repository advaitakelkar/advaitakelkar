const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
  }
}

loadEnv();

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DATABASE_ID || '37e365b8-0755-8138-b8c2-ccaa42ba73e5';

if (!token) {
  console.error("Error: NOTION_TOKEN is not set in environment or .env file.");
  process.exit(1);
}
const projectsDir = path.join(rootDir, 'src/content/projects');
const categoriesDir = path.join(rootDir, 'src/content/categories');
const tagsDir = path.join(rootDir, 'src/content/tags');

const manualMatches = {
  "37e365b8-0755-8159-aebb-f709aa6e5f37": "mumbai-airport-foodcourt.yaml",
  "37e365b8-0755-81b3-9ae9-d1a97e4f175e": "social-city-mall.yaml",
  "37e365b8-0755-81df-8d91-c13d0a9898ad": "unplugged-jamshedpur.yaml",
  "37e365b8-0755-8126-bd5f-fd2a2df6be93": "episodeone-powai.yaml",
  "37e365b8-0755-8157-bb91-ccc100452841": "bnb-khar.yaml",
  "37e365b8-0755-8162-9ccc-f0a1ae009f0a": "skadoogee.yaml",
  "37e365b8-0755-814e-b32b-f2171ffd161a": "union-pier-charleston.yaml",
  "37e365b8-0755-81a2-ac41-c3407f5ed935": "tilak-nagar-cricket-park.yaml",
  "37e365b8-0755-8183-a9a3-f9212f4e3308": "vndls.yaml",
  "37e365b8-0755-81fe-9c68-e81d0e392860": "the-4th-dimention.yaml",
  "37e365b8-0755-81c5-a6af-c92b41745e74": "reflct.yaml",
  "37e365b8-0755-81d6-aef0-d6b9903abf1c": "open-source-design-library.yaml",
  "37e365b8-0755-81b5-97fc-ee9c2b087f42": "saltwater-cafe-bandra.yaml"
};

const notionCategoryToLocal = {
  "FKD Workshop": "faizan-khatri",
  "823": "studio-823",
  "SCAD": "scad",
  "FREE": "freelancer",
  "ARCHV": "archv",
  "COLLAB": "collaboration"
};

const notionTypeToLocalTag = {
  "Interior": "interior",
  "Architecture": "architecture",
  "Landscape": "urban",
  "Artificial Intelligence": "experimentation",
  "Research": "research",
  "Artwork": "product-art",
  "Visualization": "visualisation",
  "Graphic Design": "graphic-design",
  "Music Festival": "music-festival",
  "Online Exhibition": "exhibitions",
  "Collaboration": "collaboration",
  "Product Design": "product-art"
};

function request(path, method, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function parseYaml(content) {
  const result = {};
  const lines = content.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('#') || line.trim() === '') {
      i++;
      continue;
    }
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      if (val === '|') {
        let multiline = [];
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.trim() === '') {
            multiline.push('');
            i++;
            continue;
          }
          const indentMatch = nextLine.match(/^(\s+)(.*)$/);
          if (indentMatch && indentMatch[1].length >= 2) {
            multiline.push(indentMatch[2]);
            i++;
          } else {
            break;
          }
        }
        result[key] = multiline.join('\n');
        continue;
      } else {
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        result[key] = val;
      }
    }
    i++;
  }
  return result;
}

function getPropValue(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
      return prop.title?.[0]?.plain_text || '';
    case 'rich_text':
      return prop.rich_text?.[0]?.plain_text || '';
    case 'select':
      return prop.select?.name || '';
    case 'checkbox':
      return prop.checkbox;
    default:
      return '';
  }
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function updateExistingYaml(content, updates) {
  const lines = content.split(/\r?\n/);
  const updatedKeys = new Set(Object.keys(updates));
  const newLines = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    
    if (match) {
      const key = match[1];
      const val = match[2].trim();
      
      if (updatedKeys.has(key)) {
        if (key === 'description' && val === '|') {
          i++;
          while (i < lines.length) {
            const nextLine = lines[i];
            if (nextLine.trim() === '') {
              i++;
              continue;
            }
            const indentMatch = nextLine.match(/^(\s+)(.*)$/);
            if (indentMatch && indentMatch[1].length >= 2) {
              i++;
            } else {
              break;
            }
          }
          if (updates.description) {
            newLines.push(`description: |`);
            updates.description.split('\n').forEach(l => {
              newLines.push(`  ${l}`);
            });
          }
          updatedKeys.delete('description');
          continue;
        } else {
          const newVal = updates[key];
          if (typeof newVal === 'boolean') {
            newLines.push(`${key}: ${newVal}`);
          } else if (newVal !== undefined && newVal !== null) {
            newLines.push(`${key}: "${newVal}"`);
          } else {
            newLines.push(line);
          }
          updatedKeys.delete(key);
          i++;
          continue;
        }
      }
    }
    newLines.push(line);
    i++;
  }
  
  updatedKeys.forEach(key => {
    const newVal = updates[key];
    if (key === 'description') {
      if (newVal) {
        newLines.push(`description: |`);
        newVal.split('\n').forEach(l => {
          newLines.push(`  ${l}`);
        });
      }
    } else if (typeof newVal === 'boolean') {
      newLines.push(`${key}: ${newVal}`);
    } else if (newVal !== undefined && newVal !== null && newVal !== '') {
      newLines.push(`${key}: "${newVal}"`);
    }
  });
  
  return newLines.join('\n');
}

function createNewYaml(updates) {
  let newContent = '';
  newContent += `name: "${updates.name || ''}"\n`;
  newContent += `year: "${updates.year || ''}"\n`;
  if (updates.location) newContent += `location: "${updates.location}"\n`;
  newContent += `status: "${updates.status || 'Completed'}"\n`;
  newContent += `featured: ${updates.featured || false}\n`;
  if (updates.smallIntro) newContent += `smallIntro: "${updates.smallIntro}"\n`;
  if (updates.category) newContent += `category: ${updates.category}\n`;
  if (updates.tags && updates.tags.length > 0) {
    newContent += `tags:\n`;
    updates.tags.forEach(t => {
      newContent += `  - ${t}\n`;
    });
  } else {
    newContent += `tags: []\n`;
  }
  if (updates.description) {
    newContent += `description: |\n`;
    updates.description.split('\n').forEach(line => {
      newContent += `  ${line}\n`;
    });
  }
  return newContent;
}

function getCategorySlug(notionCat) {
  if (!notionCat) return '';
  if (notionCategoryToLocal[notionCat]) {
    return notionCategoryToLocal[notionCat];
  }
  return slugify(notionCat);
}

function getTagSlug(notionType) {
  if (!notionType) return '';
  if (notionTypeToLocalTag[notionType]) {
    return notionTypeToLocalTag[notionType];
  }
  return slugify(notionType);
}

async function run() {
  try {
    // 1. Load existing local projects
    const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.yaml'));
    const localProjects = files.map(file => {
      const filePath = path.join(projectsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = parseYaml(content);
      return {
        file,
        name: parsed.name || '',
        year: parsed.year || '',
        location: parsed.location || '',
        category: parsed.category || '',
        smallIntro: parsed.smallIntro || '',
        description: parsed.description || ''
      };
    });

    console.log(`Loaded ${localProjects.length} local project files.`);

    // 2. Query Notion projects with Website=true
    const query = {
      filter: {
        property: 'Website',
        checkbox: { equals: true }
      }
    };
    console.log("Querying Notion database...");
    const response = await request(`/v1/databases/${dbId}/query`, 'POST', query);
    if (!response.results) {
      console.error("Failed to query Notion:", response);
      return;
    }

    console.log(`Found ${response.results.length} Notion pages with Website=true.\n`);

    const fallbacks = {
      name: "Untitled Project",
      year: "2026",
      smallIntro: "Project introduction placeholder.",
      description: "<p>Project description placeholder content.</p>",
      location: "Global",
      category: "freelancer"
    };

    let createdCount = 0;
    let updatedCount = 0;
    let nochangeCount = 0;
    const matchedFiles = new Set();
    const usedLocalFiles = new Set();

    for (const page of response.results) {
      const pageId = page.id;
      const notionName = getPropValue(page.properties.Name);
      const notionYear = getPropValue(page.properties.Year);
      const notionShort = getPropValue(page.properties.Short);
      const notionDesc = getPropValue(page.properties.Description);
      const notionLocation = getPropValue(page.properties.Location);
      const notionCategory = getPropValue(page.properties.Category);
      const notionType = getPropValue(page.properties.Type);

      console.log(`\nProcessing Notion Project: "${notionName}"`);

      // Determine Category Slug
      const categorySlug = getCategorySlug(notionCategory);
      if (categorySlug && notionCategory) {
        const catFilePath = path.join(categoriesDir, `${categorySlug}.yaml`);
        if (!fs.existsSync(catFilePath)) {
          console.log(`  -> Creating new Category: "${notionCategory}" (${categorySlug}.yaml)`);
          fs.writeFileSync(catFilePath, `name: ${notionCategory}\ndisplayName: ${notionCategory}\n`, 'utf8');
        }
      }

      // Determine Tag Slug
      const tagSlug = getTagSlug(notionType);
      if (tagSlug && notionType) {
        const tagFilePath = path.join(tagsDir, `${tagSlug}.yaml`);
        if (!fs.existsSync(tagFilePath)) {
          console.log(`  -> Creating new Tag: "${notionType}" (${tagSlug}.yaml)`);
          fs.writeFileSync(tagFilePath, `name: ${notionType}\n`, 'utf8');
        }
      }

      // Find local file match
      let matchFile = manualMatches[pageId];
      let match = null;

      if (matchFile) {
        match = localProjects.find(p => p.file === matchFile);
      } else {
        const normNotion = normalize(notionName);
        let bestMatch = null;
        let bestScore = 0;

        localProjects.forEach(local => {
          if (usedLocalFiles.has(local.file)) return; // Avoid duplicate matches

          const normLocal = normalize(local.name);
          if (normLocal === normNotion) {
            bestMatch = local;
            bestScore = 100;
          } else if (normNotion.includes(normLocal) || normLocal.includes(normNotion)) {
            const score = Math.min(normLocal.length, normNotion.length) / Math.max(normLocal.length, normNotion.length) * 80;
            if (score > bestScore) {
              bestMatch = local;
              bestScore = score;
            }
          }
        });

        if (bestMatch && bestScore > 40) {
          match = bestMatch;
          matchFile = bestMatch.file;
        }
      }

      if (matchFile) {
        usedLocalFiles.add(matchFile);
      }

      if (match) {
        // Update existing project
        const updates = {
          name: notionName || match.name || fallbacks.name,
          year: notionYear || match.year || fallbacks.year,
          smallIntro: notionShort || match.smallIntro || fallbacks.smallIntro,
          description: notionDesc || match.description || fallbacks.description,
          location: notionLocation || match.location || fallbacks.location,
          category: categorySlug || match.category || fallbacks.category
        };

        const filePath = path.join(projectsDir, matchFile);
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const updatedContent = updateExistingYaml(originalContent, updates);

        matchedFiles.add(matchFile);

        if (originalContent !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent, 'utf8');
          console.log(`  -> Updated local project file: ${matchFile}`);
          updatedCount++;
        } else {
          console.log(`  -> Up to date.`);
          nochangeCount++;
        }
      } else {
        // Create new project
        const updates = {
          name: notionName || fallbacks.name,
          year: notionYear || fallbacks.year,
          smallIntro: notionShort || fallbacks.smallIntro,
          description: notionDesc || fallbacks.description,
          location: notionLocation || fallbacks.location,
          category: categorySlug || fallbacks.category
        };

        const fileSlug = slugify(updates.name);
        const newFileName = `${fileSlug}.yaml`;
        const filePath = path.join(projectsDir, newFileName);

        matchedFiles.add(newFileName);

        const newProjectProps = {
          ...updates,
          status: "Completed",
          featured: false,
          tags: tagSlug ? [tagSlug] : []
        };

        const newContent = createNewYaml(newProjectProps);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`  -> Created new local project file: ${newFileName}`);
        createdCount++;
      }
    }

    // 3. Delete any local files that do not correspond to any Notion pages
    const allLocalFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.yaml'));
    let deletedCount = 0;
    allLocalFiles.forEach(file => {
      if (!matchedFiles.has(file)) {
        const filePath = path.join(projectsDir, file);
        console.log(`  -> Deleting unmatched local project file: ${file}`);
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    console.log(`\nSynchronization finished.`);
    console.log(`- Created: ${createdCount} files`);
    console.log(`- Updated: ${updatedCount} files`);
    console.log(`- Deleted: ${deletedCount} files`);
    console.log(`- Unchanged: ${nochangeCount} files`);
    console.log(`- Total local project files remaining: ${allLocalFiles.length - deletedCount}`);

  } catch (err) {
    console.error("Error during sync:", err);
  }
}

run();
