import { PageSchema } from "@batiq/core";

export const input: PageSchema = {
  name: "Page",
  navigation: {
    path: "/page",
  },
  children: [
    {
      type: "component",
      from: "@batiq/actions",
      name: "Paragraph",
      properties: {
        color: "red",
        onPress: [
          {
            type: "action",
            from: "@batiq/actions",
            name: "navigate",
            arguments: ["/page-2"],
            next: "log",
          },
          {
            type: "action",
            from: "actions",
            name: "log",
            arguments: ["Hello World"],
            id: "log",
          },
        ],
      },
      children: [],
    },
  ],
};
