import { PageIR } from "@batiq/ir";

export const input: PageIR = {
  imports: [
    {
      source: "./test",
      names: ["Paragraph"],
      default: true,
    },
  ],
  variableDeclarations: {},
  components: [
    {
      name: "PageWithNestedComponent",
      root: true,
      variableDeclarations: {},
      JSX: [
        {
          type: "element",
          name: "Test_Paragraph",
          props: [
            {
              name: "color",
              value: "blue",
            },
          ],
          children: [
            {
              type: "element",
              name: "Paragraph",
              props: [
                {
                  name: "color",
                  value: "red",
                },
              ],
              children: [],
            },
          ],
        },
        {
          type: "element",
          name: "Paragraph",
          props: [
            {
              name: "color",
              value: "blue",
            },
          ],
          children: [],
        },
      ],
    },
  ],
};
