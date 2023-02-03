import { PageIR } from "../../../../src/transformIR";

export const input: PageIR = {
  imports: [
    {
      source: "./test/paragraph",
      names: ["Paragraph"],
      default: false,
    },
    {
      source: "@react-navigation/native",
      names: ["useLinkTo"],
      default: false,
    },
  ],
  components: [
    {
      name: "Page",
      props: [],
      variableDeclarations: {
        linkTo: {
          type: "function_call",
          arguments: [],
          name: "useLinkTo",
        },
      },
      JSX: [
        {
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
                name: "linkTo",
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
