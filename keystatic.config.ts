import { config, collection, fields } from '@keystatic/core';

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
          ],
          defaultValue: 'Completed',
        }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        passcode: fields.text({ label: 'Passcode' }),
        smallIntro: fields.text({ label: 'Short Intro', multiline: true }),
        description: fields.document({
          label: 'Description',
          formatting: true,
          links: true,
        }),
        collaborator: fields.text({ label: 'Collaborator' }),
        program: fields.text({ label: 'Program' }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/projects',
          publicPath: '/images/projects/',
        }),
        multiImage: fields.array(
          fields.image({
            label: 'Image',
            directory: 'public/images/projects',
            publicPath: '/images/projects/',
          }),
          { label: 'Gallery Images', itemLabel: () => 'Image' }
        ),
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
      },
    }),
  },
});
