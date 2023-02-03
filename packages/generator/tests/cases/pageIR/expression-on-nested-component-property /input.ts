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
        paddingLeft: {
          type: "expression",
          expression: "1 + 1",
        },
      },
      children: [
        {
          type: "component",
          from: "./test/paragraph",
          name: "Paragraph",
          properties: {
            color: "red",
            paddingLeft: {
              type: "expression",
              expression: "1 + 1",
            },
          },
          children: [],
        },
      ],
    },
  ],
};
