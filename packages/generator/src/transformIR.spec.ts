import { ComponentSchema, PageSchema } from "@batiq/core";
import { transformIR } from "./transformIR";

const namedParagraphComponent: ComponentSchema = {
  from: "./test/paragraph",
  name: "Paragraph",
  properties: {
    color: "red",
  },
  children: [],
};

const defaultParagraphComponent: ComponentSchema = {
  from: "./test/paragraph",
  properties: {
    color: "blue",
  },
  children: [namedParagraphComponent],
};

const page = (components: ComponentSchema[]): PageSchema => ({
  name: "Page",
  path: "/page",
  children: components,
});

describe("Intermediate Representation", () => {
  it("should compile simple page", async () => {
    expect(await transformIR(page([namedParagraphComponent]))).toMatchObject({
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
    });
  });

  it("should compile with nested components", async () => {
    expect(await transformIR(page([defaultParagraphComponent]))).toMatchObject({
      imports: [
        {
          source: "./test/paragraph",
          names: ["Paragraph"],
          default: true,
        },
      ],
      components: [
        {
          name: "Page",
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
          ],
        },
      ],
    });
  });
});
