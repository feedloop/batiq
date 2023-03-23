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
      name: "Paragraph",
      properties: {
        color: "red",
        onPress: {
          type: "action",
          from: "@batiq/actions",
          name: "breakpoint",
          arguments: [{ base: "/page-2" }],
          root: true,
        },
      },
      children: [
        {
          type: "component",
          from: "@batiq/components",
          name: "Paragraph",
          properties: {
            color: "red",
            onPress: {
              type: "action",
              from: "@batiq/actions",
              name: "breakpoint",
              arguments: [{ base: "/page-3" }],
              root: true,
            },
          },
          children: [],
        },
      ],
    },
  ],
};
