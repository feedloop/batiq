import type { StorybookConfig } from "@storybook/core-common";

const config: StorybookConfig = {
  core: { builder: "webpack5" },
  stories: [
    "../src/app/**/*.stories.mdx",
    "../src/app/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-ondevice-actions",
    "@storybook/addon-ondevice-backgrounds",
    "@storybook/addon-ondevice-controls",
    "@storybook/addon-ondevice-notes",
  ],
};

module.exports = config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
