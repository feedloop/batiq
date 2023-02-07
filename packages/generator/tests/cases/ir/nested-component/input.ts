import { PageSchema } from "@batiq/core";

export const input: PageSchema = {
  name: "Page",
  navigation: {
    path: "/page",
  },
  children: [
    {
      type: "component",
      from: "./test",
      name: "Paragraph",
      properties: {
        color: "red",
      },
      children: [
        {
          type: "component",
          from: "./test",
          properties: {
            color: "blue",
          },
          children: [],
        },
      ],
    },
  ],
};
