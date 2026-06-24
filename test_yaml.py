from ruamel.yaml import YAML
yaml = YAML()
yaml.preserve_quotes = True
with open("src/content/projects/01-bnb-khar.yaml", "r") as f:
    data = yaml.load(f)
print("Tags:", data.get('tags', []))
print("Category:", data.get('category'))
