from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from collections import Counter
import json,hashlib,sys
root=Path(__file__).resolve().parents[1]/'dist'
if not (root/'index.html').is_file():
 print('Build first: pnpm build',file=sys.stderr);sys.exit(1)
class Page(HTMLParser):
 def __init__(self): super().__init__();self.ids=[];self.refs=[];self.missing_alt=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'): self.ids.append(a['id'])
  if tag=='img' and 'alt' not in a: self.missing_alt+=1
  for k in ['href','src','poster']:
   if a.get(k): self.refs.append((tag,k,a[k]))
  if a.get('srcset') and not a['srcset'].startswith('data:'):
   self.refs += [(tag,'srcset',s.strip().split()[0]) for s in a['srcset'].split(',') if s.strip()]
pages={p:Page() for p in root.rglob('*.html')}
for p,h in pages.items():h.feed(p.read_text())
missing=[];fragments=[];duplicates=[];alts=[];count=0
for p,h in pages.items():
 rel=str(p.relative_to(root))
 for id,n in Counter(h.ids).items():
  if n>1:duplicates.append([rel,id,n])
 if h.missing_alt:alts.append([rel,h.missing_alt])
 for tag,attr,url in h.refs:
  u=urlsplit(url)
  if (u.scheme and u.scheme not in ['http','https']) or (u.netloc and u.netloc not in ['advaitakelkar.com','www.advaitakelkar.com']):continue
  path=unquote(u.path)
  dest=(root/path.lstrip('/')) if path.startswith('/') else p.parent/path if path else p
  dest=dest.resolve()
  candidates=[dest,dest/'index.html',Path(str(dest)+'.html')]
  target=next((q for q in candidates if q.is_file()),None)
  count+=1
  if target is None:missing.append([rel,attr,url]);continue
  # The standalone exhibition wheel owns these hashes as client-side routes.
  if rel=='virtual-gods/wheel/index.html' and attr=='href' and not u.path and u.fragment: continue
  if u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:
   fragments.append([rel,url])
result={'htmlDocuments':len(pages),'localReferences':count,'missingReferences':missing,'missingFragments':fragments,'duplicateIds':duplicates,'imagesWithoutAlt':alts}
output=Path(sys.argv[1]) if len(sys.argv)>1 else root.parent/'review/built-site-audit.json'
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps(result,indent=2))
print(json.dumps({k:len(v) if isinstance(v,list) else v for k,v in result.items()},indent=2))
print('examples',json.dumps({'missing':missing[:10],'fragments':fragments[:10],'duplicates':duplicates[:10],'alt':alts[:10]}))

# Original ARCHV mirror is retained as historical source; report its missing alt text separately.
main_alts=[row for row in alts if not row[0].startswith('archv-in/')]
if missing or fragments or duplicates or main_alts: sys.exit(1)
print('Built-site integrity checks passed; historical ARCHV alt findings remain in the report.')
