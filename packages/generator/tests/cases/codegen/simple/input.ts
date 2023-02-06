import { PageIR } from "../../../../src/intermediate-representation";

export const input: PageIR = {
  imports: [
    {
      source: "./test/paragraph",
      names: ["Paragraph"],
      default: false,
    },
  ],
  components: [
    {
      name: "Page",
      root: true,
      props: [],
      variableDeclarations: {},
      JSX: [
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
  ],
};
