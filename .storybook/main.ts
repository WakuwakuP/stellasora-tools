import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { type StorybookConfig } from '@storybook/nextjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  webpackFinal: async (webpackConfig: import('webpack').Configuration) => {
    webpackConfig.resolve = {
      ...(webpackConfig.resolve || {}),
    }
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve?.alias || {}),
      '@prisma/client': path.resolve(__dirname, './__mocks__/prisma.ts'),
    }
    return webpackConfig
  },
}

export default config
