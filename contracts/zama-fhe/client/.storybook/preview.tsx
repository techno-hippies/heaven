import '../src/index.css'

import type { Preview } from 'storybook-solidjs'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fffaf9' },
        { name: 'light-subtle', value: '#fff5f3' },
        { name: 'noir', value: '#09090b' },
        { name: 'card', value: '#18181b' },
      ],
    },
  },
}

export default preview
