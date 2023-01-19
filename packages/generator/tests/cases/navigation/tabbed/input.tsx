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
        tab: {
          label: "Home",
          icon: "home",
        },
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
    {
      name: "page 3",
      navigation: {
        path: "/page-3",
        tab: {
          label: "About",
          icon: "about",
        },
      },
      children: [],
    },
    {
      name: "page 4",
      navigation: {
        path: "/page-4",
        tab: {
          label: "Settings",
          icon: "Settings",
        },
      },
      children: [],
    },
  ],
};
