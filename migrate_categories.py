import os
import shutil
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

cat_map = {
    'faizan-khatri': 'work',
    'anla': 'work',
    'studio-823': 'work',
    'advt': 'freelancer',
    'freelancer': 'freelancer',
    'scad': 'academic',
    'barch': 'academic',
    'archv': 'archv',
    'work': 'work'
}

tags_to_ensure = {
    'faizan-khatri': 'faizan-khatri',
    'anla': 'anla',
    'studio-823': 'studio-823',
    'advt': 'advt',
    'scad': 'scad',
    'barch': 'barch'
}

# 1. Create missing tags if they don't exist
tags_dir = 'src/content/tags'
for t in tags_to_ensure.values():
    tag_file = os.path.join(tags_dir, f"{t}.yaml")
    if not os.path.exists(tag_file):
        with open(tag_file, 'w') as f:
            f.write(f"name: {t.replace('-', ' ').title()}\n")

# 2. Update projects
proj_dir = 'src/content/projects'
for f in os.listdir(proj_dir):
    if f.endswith('.yaml'):
        path = os.path.join(proj_dir, f)
        try:
            with open(path, 'r') as file:
                data = yaml.load(file)
            
            old_cat = data.get('category')
            if old_cat in cat_map:
                new_cat = cat_map[old_cat]
                data['category'] = new_cat
                
                # Add to tags if needed
                if old_cat in tags_to_ensure:
                    tag_to_add = tags_to_ensure[old_cat]
                    if 'tags' not in data or data['tags'] is None:
                        data['tags'] = []
                    
                    # Ruamel YAML might load tags as a special list type
                    if isinstance(data['tags'], list):
                        # check if it's already there
                        if tag_to_add not in [t for t in data['tags']]:
                            data['tags'].append(tag_to_add)
                
                with open(path, 'w') as file:
                    yaml.dump(data, file)
        except Exception as e:
            print(f"Error processing {f}: {e}")

# 3. Setup the 4 categories
cats_dir = 'src/content/categories'

with open(os.path.join(cats_dir, 'academic.yaml'), 'w') as f:
    f.write("name: Academic\ndisplayName: Academic\n")

with open(os.path.join(cats_dir, 'work.yaml'), 'w') as f:
    f.write("name: Work\ndisplayName: Work\n")

with open(os.path.join(cats_dir, 'freelancer.yaml'), 'w') as f:
    f.write("name: Freelancer\ndisplayName: Freelancer\n")

with open(os.path.join(cats_dir, 'archv.yaml'), 'w') as f:
    f.write("name: Archv\ndisplayName: ARCHV\n")

# Remove unused categories
unused = ['faizan-khatri.yaml', 'anla.yaml', 'studio-823.yaml', 'advt.yaml', 'scad.yaml', 'barch.yaml', 'collaboration.yaml']
for u in unused:
    try:
        os.remove(os.path.join(cats_dir, u))
    except:
        pass

print("Migration completed!")
