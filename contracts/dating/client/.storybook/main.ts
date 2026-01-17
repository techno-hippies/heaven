import type { StorybookConfig } from 'storybook-solidjs-vite'
import tailwindcss from '@tailwindcss/vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {
      docgen: false,
    },
  },
  viteFinal: (config) => {
    config.plugins = config.plugins || []
    config.plugins.push(tailwindcss())
    return config
  },
}

export default config
