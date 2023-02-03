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
          from: "@react-navigation/native",
          name: "useLinkTo",
          properties: ["/page-2"],
          root: true,
        },
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
              from: "@react-navigation/native",
              name: "useLinkTo",
              properties: ["/page-2"],
              root: true,
            },
          },
          children: [],
        },
      ],
    },
  ],
};
