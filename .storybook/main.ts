import type { StorybookConfig } from "@storybook/core-common";

export const rootMain: StorybookConfig = {
  stories: [],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: true,
  },
};
