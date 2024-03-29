import { PageIR } from "@batiq/ir";

export const input: PageSchema = {
  imports: [
    {
      source: "@batiq/expo-runtime",
      names: ["PageWrapper"],
      default: null,
    },
    {
      source: "@batiq/components/elements",
      names: ["Text"],
      default: null,
    },
    {
      source: "@batiq/expression",
      names: ["useLazyExpression"],
      default: null,
    },
  ],
  variableDeclarations: {},
  components: [
    {
      name: "Page",
      variableDeclarations: {
        evaluate: {
          type: "function_call",
          arguments: [],
          name: "useLazyExpression",
        },
      },
      JSX: [
        {
          type: "element",
          name: "PageWrapper",
          props: [],
          children: [
            {
              type: "element",
              name: "Text",
              props: [
                {
                  name: "color",
                  value: "blue",
                },
              ],
              children: [
                "Hello",
                false,
                123,
                {
                  type: "jsx_expression",
                  value: {
                    type: "function_call",
                    name: "evaluate",
                    arguments: ["1 + 1"],
                  },
                },
              ],
            },
          ],
        },
      ],
      root: true,
    },
  ],
};
