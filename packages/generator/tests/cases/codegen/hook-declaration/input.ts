import { PageIR } from "../../../../src/intermediate-representation";

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
  components: [
    {
      name: "Page",
      props: [],
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
