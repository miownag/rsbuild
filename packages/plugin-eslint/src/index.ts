import path from 'node:path';
import type { RsbuildPlugin } from '@rsbuild/core';
import type { Options } from 'eslint-webpack-plugin';

export type PluginEslintOptions = {
  /**
   * Whether to enable ESLint checking.
   * @default true
   */
  enable?: boolean;
  /**
   * To modify the options of `eslint-webpack-plugin`.
   * @see https://github.com/webpack-contrib/eslint-webpack-plugin
   */
  eslintPluginOptions?: Options;
};

export const pluginEslint = (
  options: PluginEslintOptions = {},
): RsbuildPlugin => ({
  name: 'rsbuild:eslint',

  setup(api) {
    const { enable = true, eslintPluginOptions } = options;

    if (!enable) {
      return;
    }

    api.modifyBundlerChain(async (chain, { target, CHAIN_ID }) => {
      // If there is multiple target, only apply eslint plugin to the first target
      // to avoid multiple eslint running at the same time
      if (target !== api.context.targets[0]) {
        return;
      }

      const { default: ESLintPlugin } = await import('eslint-webpack-plugin');
      const defaultOptions = {
        extensions: ['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'mts', 'cts'],
        exclude: [
          'node_modules',
          path.relative(api.context.rootPath, api.context.distPath),
        ],
      };

      chain.plugin(CHAIN_ID.PLUGIN.ESLINT).use(ESLintPlugin, [
        {
          ...defaultOptions,
          ...eslintPluginOptions,
        },
      ]);
    });
  },
});