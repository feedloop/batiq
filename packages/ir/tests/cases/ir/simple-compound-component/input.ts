import { PageSchema, LocalCompoundComponent } from "@batiq/core";
import { Type } from "@sinclair/typebox";

export const components: Record<string, LocalCompoundComponent> = {
  CompoundButton: {
    definitions: {
      inputs: {
        color: Type.String({ default: "green" }),
      },
    },
    component: {
      from: "@batiq/components",
      name: "Button",
      id: "MainButton",
      properties: {
        color: {
          type: "expression",
          expression: "props.color",
        },
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
      properties: {
        color: "red",
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
