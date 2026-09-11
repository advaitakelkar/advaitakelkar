# Reusable website pages

Project pages share `src/pages/projects/[slug].astro`; category archives share their existing layout. New projects should use the shared renderer rather than duplicate a page.

## Choose a project template

Set the optional `template` field in a project YAML or the Keystatic Page template control:

| Value | Use |
|---|---|
| `auto` or omitted | Preserve the existing layout selection. All current project files remain unchanged. |
| `tabs` | Project summary plus Design and Making, or chapters when supplied. |
| `cards` | Curated image card deck, without generic Design/Making sections. |
| `chapters` | Summary and long-form chapter tabs, using the existing chapters array. |

`src/lib/projectTemplates.ts` holds the selection rules. Existing Scarpin people tabs and Virtual Gods exhibition remain bespoke. The chapter template needs chapter content to show chapter tabs; otherwise the renderer keeps Design/Making available.

## Future Design and Making content

Both fields are optional HTML strings. Leave them absent or empty until Adi supplies content. No placeholder prose or N/A rows are required. Existing real project metadata is retained.

```yaml
template: tabs
design: ''
making: ''
```

For long-form projects use the existing `chapters` list: each entry has a title, optional subtitle, and HTML body. Do not copy research claims directly from Notion without reviewing them.

## Shared controls

`src/lib/accordion.ts` provides exclusive single-click toggles, keyboard activation, and double-click open/close-all for project tabs. Collapsed content is inert. `src/lib/dialogFocus.ts` manages keyboard focus in the project gate and primary image gallery.

`src/lib/projectAccess.ts` is the single public-project list used by the gate, listings, homepage and sitemap. Keep the current ten entries until another project is reviewed. The placeholder portfolio is stored outside public assets; replace the PortfolioStatus component only when a final portfolio is ready.
