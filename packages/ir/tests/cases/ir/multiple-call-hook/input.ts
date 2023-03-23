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
        text: "To Page 2",
        color: "red",
        onPress: {
          type: "action",
          from: "@batiq/actions",
          name: "navigate",
          arguments: ["/page-2"],
        },
      },
      children: [],
    },
    {
      type: "component",
      from: "@batiq/components",
      name: "Paragraph",
      properties: {
        text: "To Page 3",
        color: "red",
        onPress: {
          type: "action",
          from: "@batiq/actions",
          name: "useNavigate",
          arguments: ["/page-3"],
        },
      },
      children: [],
    },
  ],
};
