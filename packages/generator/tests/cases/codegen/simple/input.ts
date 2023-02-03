import { PageIR } from "../../../../src/transformIR";

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
