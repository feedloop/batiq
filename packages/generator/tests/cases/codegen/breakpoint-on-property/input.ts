export const input = {
  imports: [
    {
      source: "@batiq/components",
      names: ["Paragraph"],
      default: null,
    },
    {
      source: "@batiq/actions",
      names: ["breakpoint", "navigate"],
      default: null,
    },
  ],
  variableDeclarations: {},
  components: [
    {
      name: "Page",
      variableDeclarations: {
        breakpoint_: {
          type: "function_call",
          arguments: [],
          name: "breakpoint",
        },
        navigate_: {
          type: "function_call",
          arguments: [],
          name: "navigate",
        },
        navigate_1: {
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
                name: "breakpoint_",
                arguments: [
                  {
                    sm: {
                      type: "function_call",
                      name: "navigate_",
                      arguments: ["/page-1"],
                    },
                    md: {
                      type: "function_call",
                      name: "navigate_1",
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
