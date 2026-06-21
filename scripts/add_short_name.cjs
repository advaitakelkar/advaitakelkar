const https = require('https');
const path = require('path');
const fs = require('fs');

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

function abbrevName(name) {
  return name.trim().split(/\s+/).filter(w => w.length > 0).map(w => w.length <= 3 ? w : w.slice(0, 3)).join(' ');
}

function getPropValue(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
      return prop.title?.[0]?.plain_text || '';
    case 'rich_text':
      return prop.rich_text?.[0]?.plain_text || '';
    default:
      return '';
  }
}

async function run() {
  console.log("Fetching database...");
  const db = await request(`/v1/databases/${dbId}`, 'GET');
  if (!db.properties) {
    console.error("Failed to load db", db);
    return;
  }
  
  if (!db.properties['SHORT NAME']) {
    console.log("Adding SHORT NAME property to database...");
    await request(`/v1/databases/${dbId}`, 'PATCH', {
      properties: {
        "SHORT NAME": {
          "rich_text": {}
        }
      }
    });
    console.log("Property added.");
  } else {
    console.log("SHORT NAME property already exists.");
  }

  console.log("Querying pages...");
  let has_more = true;
  let next_cursor = undefined;
  
  while (has_more) {
    const body = {};
    if (next_cursor) body.start_cursor = next_cursor;
    
    const response = await request(`/v1/databases/${dbId}/query`, 'POST', body);
    
    for (const page of response.results) {
      const name = getPropValue(page.properties.Name);
      if (!name) continue;
      
      const shortName = abbrevName(name);
      
      // Update page
      console.log(`Updating page "${name}" with SHORT NAME "${shortName}"...`);
      await request(`/v1/pages/${page.id}`, 'PATCH', {
        properties: {
          "SHORT NAME": {
            "rich_text": [
              {
                "text": {
                  "content": shortName
                }
              }
            ]
          }
        }
      });
    }
    
    has_more = response.has_more;
    next_cursor = response.next_cursor;
  }
  console.log("Done.");
}

run();
