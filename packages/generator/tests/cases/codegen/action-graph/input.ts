import { PageIR } from "@batiq/ir";

export const input: PageIR = {
  imports: [
    {
      source: "./test",
      names: ["Paragraph", "navigate"],
      default: false,
    },
    {
      source: "@batiq/actions",
      names: ["useActionGraph"],
      default: false,
    },
    {
      source: "actions",
      names: ["log"],
      default: false,
    },
  ],
  variableDeclarations: {},
  components: [
    {
      name: "Page",
      variableDeclarations: {
        navigate_: {
          type: "function_call",
          arguments: [],
          name: "navigate",
        },
        actionGraph: {
          type: "function_call",
          arguments: [
            {
              nodes: [
                {
                  type: "function_definition",
                  async: true,
                  parameters: ["evaluate"],
                  return: {
                    type: "function_call",
                    name: "navigate_",
                    arguments: ["/page-2"],
                  },
                },
                {
                  type: "function_definition",
                  async: true,
                  parameters: ["evaluate"],
                  return: {
                    type: "function_call",
                    name: "log",
                    arguments: ["Hello World"],
                  },
                },
              ],
              successEdges: [[0, 1]],
              errorEdges: [],
            },
          ],
          name: "useActionGraph",
        },
      },
      JSX: [
        {
          type: "element",
          name: "Paragraph",
          props: [
            {
              name: "color",
              value: "red",
            },
            {
              name: "onPress",
              value: {
                type: "variable",
                name: "actionGraph",
              },
            },
          ],
          children: [],
        },
      ],
      root: true,
    },
  ],
};
