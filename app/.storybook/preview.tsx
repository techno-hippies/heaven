import type { Preview } from 'storybook-solidjs'
import { MemoryRouter, Route } from '@solidjs/router'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1625' },
        { name: 'light', value: '#faf8f5' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter root={(props) => props.children}>
        <Route path="*" component={Story} />
      </MemoryRouter>
    ),
  ],
}

export default preview
