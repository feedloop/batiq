import { PageIR } from "../../../../src/transformIR";

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
          name: "Test_Paragraph",
          props: [
            {
              name: "color",
              value: "blue",
            },
          ],
          children: [
            {
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
