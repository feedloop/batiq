import { AppSchema } from "@batiq/core";

export const input: AppSchema = {
  batiq: "1",
  info: {
    name: "app",
  },
  platform: "web",
  prefixes: ["http://localhost"],
  config: {},
  pages: [
    {
      name: "page 1",
      navigation: {
        path: "/page-1",
      },
      children: [],
    },
    {
      name: "page 2",
      navigation: {
        path: "/page-2",
      },
      children: [],
    },
  ],
};
