import { ComponentDefinition, ComponentSchema, PageSchema } from "@batiq/core";
import Ajv from "ajv";

const ajv = new Ajv();

export type ComponentImport = {
  source: string;
  names: string[];
  default: boolean;
};

export type Prop = {
  name: string;
  value: string | number | boolean | Array<any> | Record<string, any>;
};

export type JSX = {
  name: string;
  props: Prop[];
  children: JSX[];
};

export type Component = {
  name: string;
  props: Prop[];
  JSX: JSX[];
  root: boolean;
};

export type PageIR = {
  imports: ComponentImport[];
  components: Component[];
};

const mergeImports = (imports: ComponentImport[]): ComponentImport[] =>
  imports.reduce(
    (carry, imp) =>
      carry.some((i) => i.source === imp.source)
        ? carry.map((c) =>
            c.source === imp.source
              ? {
                  ...c,
                  names: Array.from(new Set([...c.names, ...imp.names])),
                  default: c.default || imp.default,
                }
              : c
          )
        : carry.concat(imp),
    [] as ComponentImport[]
  );

export const toVariableName = (source: string): string =>
  source
    .split(/\W+/)
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join("_");

const transform = async (
  schema: ComponentSchema
): Promise<[ComponentImport[], JSX]> => {
  const component: ComponentDefinition<Record<string, any>> = (
    await import(schema.from)
  )[schema.name ?? "default"];
  if (!ajv.validate(component.inputs, schema.properties)) {
    throw new Error(ajv.errorsText());
  }

  const imports = [
    schema.name
      ? {
          source: schema.from,
          names: [schema.name],
          default: false,
        }
      : { source: schema.from, names: [], default: true },
  ];
  const props = Object.entries(schema.properties).map(([name, value]) => ({
    name,
    value,
  }));

  const [childrenImports, children] = (
    await Promise.all(schema.children.map(transform))
  ).reduce(
    ([imports, jsx], [childImport, childJsx]) => {
      return [imports.concat(childImport), jsx.concat(childJsx)];
    },
    [[], []] as [ComponentImport[], JSX[]]
  );

  return [
    imports.concat(childrenImports),
    {
      name: schema.name ?? toVariableName(schema.from),
      props,
      children,
    },
  ];
};

export const transformIR = async (page: PageSchema): Promise<PageIR> => {
  const [imports, JSX] = (
    await Promise.all(page.children.map(transform))
  ).reduce(
    ([imports, jsx], [childImport, childJsx]) => [
      mergeImports(imports.concat(childImport)),
      jsx.concat(childJsx),
    ],
    [[], []] as [ComponentImport[], JSX[]]
  );

  return {
    imports,
    components: [
      {
        name: toVariableName(page.name),
        props: [],
        JSX,
        root: true,
      },
    ],
  };
};
