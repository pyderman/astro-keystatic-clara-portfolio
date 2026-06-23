import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage:
    import.meta.env.MODE === 'production'
      ? { kind: 'cloud' }
      : { kind: 'local' },

  cloud: {
    project: 'puzzled-studio-team/astro-keystatic-cla',
  },

  ui: {
    brand: { name: 'Clara Holm' },
  },

  collections: {
    photos: collection({
      label: 'Photos',
      slugField: 'title',
      path: 'content/photos/*',
      format: { data: 'yaml' },
      schema: {
        title: fields.text({ label: 'Title' }),
        location: fields.text({ label: 'Location' }),
        year: fields.integer({ label: 'Year' }),
        image: fields.image({
          label: 'Photo',
          directory: 'public/photos',
          publicPath: '/photos/',
        }),
        alt_text: fields.text({ label: 'Alt text' }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
      },
    }),
  },

  singletons: {
    site: singleton({
      label: 'Site settings',
      path: 'content/site',
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Full name' }),
        tagline: fields.text({ label: 'Tagline' }),
        email: fields.text({ label: 'Email' }),
        instagram: fields.text({ label: 'Instagram handle' }),
        spotify_embed_url: fields.url({ label: 'Spotify embed URL', description: 'From Spotify: right-click playlist → Share → Copy link, then replace open.spotify.com/playlist/ with open.spotify.com/embed/playlist/' }),
      },
    }),
    about: singleton({
      label: 'About page',
      path: 'content/about',
      format: { data: 'yaml' },
      schema: {
        portrait: fields.image({
          label: 'Portrait',
          directory: 'public/photos',
          publicPath: '/photos/',
        }),
        portrait_alt: fields.text({ label: 'Portrait alt text' }),
        bio: fields.text({ label: 'Bio', multiline: true }),
        clients: fields.array(fields.text({ label: 'Client / Publication' }), {
          label: 'Clients & Publications',
          itemLabel: (props) => props.value,
        }),
        cv_url: fields.url({ label: 'CV download URL' }),
      },
    }),
  },
});
