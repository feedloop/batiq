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
        onPress: {
          type: "action",
          from: "./test",
          name: "navigate",
          arguments: ["/page-2"],
          root: true,
        },
      },
      children: [
        {
          type: "component",
          from: "./test",
          name: "Paragraph",
          properties: {
            color: "red",
            onPress: {
              type: "action",
              from: "./test",
              name: "navigate",
              arguments: ["/page-2"],
              root: true,
            },
          },
          children: [],
        },
      ],
    },
  ],
};
