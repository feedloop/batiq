import { generate } from "./codegen";

describe("Code Generator", () => {
  it("should be able to generate code from simple IR", async () => {
    expect(
      await generate({
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
      })
    ).toMatchInlineSnapshot(`
      "import { Paragraph } from \\"./test/paragraph\\";
      const Page = props => {
        return <Paragraph color={\\"red\\"} />;
      };
      export default Page;"
    `);
  });

  it("should be able to generate code from nested IR", async () => {
    expect(
      await generate(
        {
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
        },
        true
      )
    ).toMatchInlineSnapshot(`
      "import Test_Paragraph, { Paragraph } from \\"./test/paragraph\\";
      const PageWithNestedComponent = (props) => {
        return (
          <>
            <Test_Paragraph color={\\"blue\\"}>
              <Paragraph color={\\"red\\"} />
            </Test_Paragraph>
            <Paragraph color={\\"blue\\"} />
          </>
        );
      };
      export default PageWithNestedComponent;
      "
    `);
  });
});
