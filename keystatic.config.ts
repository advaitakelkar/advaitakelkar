import { config, collection, fields } from '@keystatic/core';

// These structured presentation fields are authored in YAML. Preserve their exact
// values when saving the simpler editorial form; do not coerce mixed galleries
// or chapter/pipeline data into a different storage format.
const presentationFields = Object.fromEntries([
  'shortName', 'interactive', 'designBrief', 'scrubImages', 'sideImage', 'leadImage',
  'leadFigures', 'slider', 'leadSlides', 'sideVideo', 'pipeline', 'groups',
  'collectionCredit', 'views', 'aim', 'participants', 'pillRows', 'people',
  'professors', 'chapterNav', 'chapters', 'downloads', 'studio',
].map(name => [name, fields.ignored()]));

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'AK Studio',
    },
  },
  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'name',
      path: 'src/content/projects/*',
      format: { data: 'yaml' },
      schema: {
        ...presentationFields,
        name: fields.slug({ name: { label: 'Project Name' } }),
        numbr: fields.number({ label: 'Number' }),
        year: fields.text({ label: 'Year' }),
        client: fields.text({ label: 'Client' }),
        size: fields.text({ label: 'Size' }),
        location: fields.text({ label: 'Location' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Completed', value: 'Completed' },
            { label: 'Ongoing', value: 'Ongoing' },
            { label: 'Unbuilt', value: 'Unbuilt' },
            { label: 'Proposed', value: 'Proposed' },
            { label: 'Rejected proposal', value: 'Rejected proposal' },
            { label: 'Design study', value: 'Design study' },
          ],
          defaultValue: 'Completed',
        }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        passcode: fields.text({ label: 'Passcode' }),
        template: fields.select({ label: 'Page template', options: [
          { label: 'Project 01 — copy, stage and rail of covers', value: 'project-01' },
          { label: 'AI Series — named images, portrait or landscape from the pictures', value: 'ai-series' },
        ], defaultValue: 'project-01' }),
        design: fields.text({ label: 'Design (optional HTML)', multiline: true }),
        making: fields.text({ label: 'Making (optional HTML)', multiline: true }),
        smallIntro: fields.text({ label: 'Short Intro', multiline: true }),
        description: fields.text({ label: 'Description (HTML)', multiline: true }),
        collaborator: fields.text({ label: 'Collaborator' }),
        program: fields.text({ label: 'Program' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/projects',
          publicPath: '/images/projects/',
        }),
        multiImage: fields.ignored(),
        tags: fields.array(
          fields.relationship({ label: 'Tag', collection: 'tags' }),
          { label: 'Tags', itemLabel: (props) => props.value ?? 'Tag' }
        ),
        category: fields.relationship({
          label: 'Category',
          collection: 'categories',
        }),
      },
    }),

    tags: collection({
      label: 'Tags',
      slugField: 'name',
      path: 'src/content/tags/*',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Tag Name' } }),
      },
    }),

    categories: collection({
      label: 'Categories',
      slugField: 'name',
      path: 'src/content/categories/*',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Category Name' } }),
        displayName: fields.text({ label: 'Display Name' }),
        shareImage: fields.text({ label: 'Share image path' }),
        links: fields.ignored(),
        tagline: fields.text({ label: 'Tagline' }),
        intro: fields.array(
          fields.text({ label: 'Paragraph', multiline: true }),
          { label: 'Intro paragraphs', itemLabel: () => 'Paragraph' }
        ),
      },
    }),
  },
});
