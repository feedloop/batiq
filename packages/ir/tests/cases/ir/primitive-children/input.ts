import { PageSchema } from "@batiq/core";

export const input: PageSchema = {
  name: "Page",
  navigation: {
    path: "/page",
  },
  children: [
    {
      type: "component",
      from: "@batiq/components",
      name: "Text",
      properties: {
        color: "blue",
      },
      children: [
        "Hello",
        false,
        123,
        {
          type: "expression",
          expression: "1 + 1",
        },
      ],
    },
  ],
};
