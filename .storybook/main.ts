import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../apps/**/*.stories.@(ts|tsx|js|jsx|mjs|cjs|mdx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}

export default config