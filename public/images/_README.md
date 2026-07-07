# Image folders

Structure:

```
images/
  admin/            → site assets (logo, favicon, profile photo)
  <project-slug>/   → one folder per project (matches the YAML filename in
                      src/content/projects/, e.g. episode-kolkata/)
```

## Naming convention (per project folder)

- `cover.<ext>`  → the project's cover image (used on cards & sliders)
- `01.<ext>`, `02.<ext>`, … → gallery images (used by `multiImage`)

`<ext>` can be `.jpg`, `.webp`, or `.png`. **Prefer optimized JPG/WebP** and
keep files small (ideally < 300 KB) to keep the site fast.

## Adding images to a project

1. Drop the optimized files into the project's folder using the names above.
2. In `src/content/projects/<slug>.yaml`, set:
   ```yaml
   coverImage: "/images/<slug>/cover.jpg"
   multiImage:
     - "/images/<slug>/01.jpg"
     - "/images/<slug>/02.jpg"
   ```

That's it — the card, slider, and project page will pick them up automatically.
