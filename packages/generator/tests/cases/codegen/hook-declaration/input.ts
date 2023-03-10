import { PageIR } from "@batiq/ir";

export const input: PageIR = {
  imports: [
    {
      source: "./test",
      names: ["Paragraph"],
      default: false,
    },
    {
      source: "./test",
      names: ["navigate"],
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
                type: "function_call",
                name: "navigate_",
                arguments: ["/page-2"],
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
