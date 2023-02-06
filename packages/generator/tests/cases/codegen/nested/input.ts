import { PageIR } from "../../../../src/intermediate-representation";

export const input: PageIR = {
  imports: [
    {
      source: "./test/paragraph",
      names: ["Paragraph"],
      default: true,
    },
  ],

  components: [
    {
      name: "PageWithNestedComponent",
      root: true,
      props: [],
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
