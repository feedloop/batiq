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
        text: "To Page 2",
        color: "red",
        onPress: {
          type: "action",
          from: "./test",
          name: "navigate",
          arguments: ["/page-2"],
        },
      },
      children: [],
    },
    {
      type: "component",
      from: "./test",
      name: "Paragraph",
      properties: {
        text: "To Page 3",
        color: "red",
        onPress: {
          type: "action",
          from: "./test",
          name: "useNavigate",
          arguments: ["/page-3"],
        },
      },
      children: [],
    },
  ],
};
