export const input = {
  imports: [
    {
      source: "./test",
      names: ["Paragraph", "breakpoint", "navigate"],
      default: null,
    },
  ],
  variableDeclarations: {},
  components: [
    {
      name: "Page",
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
            {
              name: "onPress",
              value: {
                type: "function_call",
                name: "breakpoint",
                arguments: [
                  {
                    sm: {
                      type: "function_call",
                      name: "navigate",
                      arguments: ["/page-1"],
                    },
                    md: {
                      type: "function_call",
                      name: "navigate",
                      arguments: ["/page-2"],
                    },
                  },
                ],
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
