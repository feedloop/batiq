import { PageIR } from "@batiq/ir";

export const input: PageIR = {
  imports: [
    {
      source: "./test",
      names: ["Paragraph"],
      default: false,
    },
  ],
  variableDeclarations: {},
  components: [
    {
      name: "Page",
      root: true,
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
