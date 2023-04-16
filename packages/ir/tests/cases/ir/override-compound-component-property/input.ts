import { PageSchema, LocalCompoundComponent } from "@batiq/core";

export const components: Record<string, LocalCompoundComponent> = {
  CompoundButton: {
    inputs: {},
    component: {
      type: "component",
      from: "@batiq/components",
      name: "Button",
      id: "MainButton",
      properties: {
        color: "green",
      },
      children: [
        {
          type: "expression",
          expression: "23 + 42",
        },
        {
          type: "slot",
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
      overrideProperties: {
        MainButton: { color: "red" },
      },
      children: [
        {
          type: "component",
          from: "@batiq/components",
          name: "Text",
          properties: {
            text: "Hello World!",
          },
          children: [],
        },
      ],
    },
  ],
};
