import { PageSchema, LocalCompoundComponent } from "@batiq/core";

export const components: Record<string, LocalCompoundComponent> = {
  CompoundButton: {
    definitions: {},
    component: {
      from: "@batiq/components",
      name: "Button",
      id: "MainButton",
      properties: {
        color: "green",
      },
      children: [
        {
          type: "component",
          from: "@batiq/components",
          name: "Text",
          id: "CompoundText",
          properties: {
            text: "This will be overridden",
          },
          children: [
            {
              type: "slot",
            },
          ],
        },
      ],
    },
  },
};
export const input: PageSchema = {
  name: "Page",
  navigation: {
    path: "/page",
  },
  children: [
    {
      type: "component",
      from: "local",
      name: "CompoundButton",
      properties: {},
      overrideComponents: {
        CompoundText: {
          type: "component",
          from: "@batiq/components",
          name: "Text",
          properties: {
            text: "Hello World!",
          },
          children: [
            {
              type: "expression",
              expression: "23 + 42",
            },
          ],
        },
      },
      children: [
        {
          type: "component",
          from: "@batiq/components",
          name: "Text",
          properties: {
            text: "Child Text",
          },
          children: [],
        },
      ],
    },
  ],
};
