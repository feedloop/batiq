import { PageSchema } from "@batiq/core";

export const input: PageSchema = {
  name: "Page",
  navigation: {
    path: "/page",
  },
  children: [
    {
      type: "component",
      from: "./test/paragraph",
      name: "Paragraph",
      properties: {
        color: "red",
        onPress: {
          type: "action",
          from: "./test/navigate",
          name: "navigate",
          properties: ["/page-2"],
        },
      },
      children: [],
    },
  ],
};
