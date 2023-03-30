import { AppSchema } from "@batiq/core";
import { toVariableName } from "./utils/naming";
import { PageIR, ComponentImport, Value, Component } from "./types";

export const generateNavigationPageIR = (schema: AppSchema): PageIR => {
  const imports: ComponentImport[] = [
    {
      source: "@batiq/expo-runtime",
      names: ["AppProvider", "Navigation"],
      default: null,
    },
    ...schema.pages.map((page) => ({
      source: `./pages/${toVariableName(page.name)}`,
      names: [],
      default: toVariableName(`./pages/${toVariableName(page.name)}`),
    })),
  ];

  const variableDeclarations: [string, Value][] = [
    [
      "schema",
      {
        type: "json",
        value: schema,
      },
    ],
    [
      "importMaps",
      Object.fromEntries(
        schema.pages.map((page) => [
          page.navigation.path,
          {
            type: "variable",
            name: toVariableName(`./pages/${toVariableName(page.name)}`),
          },
        ])
      ),
    ],
  ];

  const appComponent: Component = {
    name: "App",
    variableDeclarations: {},
    root: true,
    JSX: [
      {
        type: "element",
        name: ["AppProvider"],
        props: [
          {
            name: "schema",
            value: {
              type: "variable",
              name: "schema",
            },
          },
        ],
        children: [
          {
            type: "element",
            name: "Navigation",
            props: [
              {
                name: "importMaps",
                value: {
                  type: "variable",
                  name: "importMaps",
                },
              },
            ],
            children: [],
          },
        ],
      },
    ],
  };

  return {
    imports,
    variableDeclarations: Object.fromEntries(variableDeclarations),
    components: [appComponent],
  };
};
