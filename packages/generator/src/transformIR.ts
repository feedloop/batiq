import {
  ActionSchema,
  ComponentSchema,
  Container,
  ExpressionSchema,
  PageSchema,
  Value as SchemaValue,
} from "@batiq/core";
import Ajv from "ajv";
import { groupBy } from "./utils/groupBy";
import { hookResultName, toVariableName } from "./utils/naming";

const ajv = new Ajv();

export type ComponentImport = {
  source: string;
  names: string[];
  default: boolean;
};

export type FunctionCall = {
  type: "function_call";
  name: string;
  arguments: Container<Primitive>[];
};

type Primitive = ComponentSchema | string | number | boolean;
export type Value = Container<FunctionCall | Primitive>;

export type JSX = {
  name: string;
  props: { name: string; value: Value }[];
  children: JSX[];
};

export type Component = {
  name: string;
  props: Value[];
  variableDeclarations: Record<string, Value>;
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

type TransformResult = {
  imports: ComponentImport[];
  variables: [string, Value][];
  jsx: JSX;
  additionalComponents: Component[];
};

const transform = async (
  schema: ComponentSchema,
  isRoot = true
): Promise<TransformResult> => {
  // const component: ComponentDefinition<Record<string, any>> = (
  //   await importModuleCwd(schema.from)
  // )[schema.name ?? "default"];
  // if (!ajv.validate(component.inputs, schema.properties)) {
  //   throw new Error(ajv.errorsText());
  // }

  const imports_ = [
    schema.name
      ? {
          source: schema.from,
          names: [schema.name],
          default: false,
        }
      : { source: schema.from, names: [], default: true },
  ];

  const primitives = Object.entries(schema.properties).filter(
    (entry): entry is [string, SchemaValue] =>
      Array.isArray(entry[1]) ||
      !(
        typeof entry[1] === "object" &&
        (entry[1].type === "action" || entry[1].type === "expression")
      )
  );
  const actionAndExpressions = Object.entries(schema.properties).filter(
    (entry): entry is [string, ActionSchema | ExpressionSchema] =>
      !Array.isArray(entry[1]) &&
      typeof entry[1] === "object" &&
      (entry[1].type === "action" || entry[1].type === "expression")
  );
  const splitComponent = actionAndExpressions.some(
    ([, value]) =>
      !isRoot &&
      (value.type === "expression" ||
        (value.type === "action" &&
          ((value.name.startsWith("use") && value.isHook !== false) ||
            value.isHook === true)))
  );

  const props = primitives.map(
    ([name, value]): { name: string; value: Value } => ({
      name,
      value,
    })
  );
  const { hooks = [], calls = [] } = groupBy(
    ([, value]) =>
      value.type === "expression" ||
      (value.type === "action" &&
        value.name.startsWith("use") &&
        value.isHook !== false)
        ? "hooks"
        : "calls",
    actionAndExpressions
  );
  const actionHooks = hooks.filter(
    (entry): entry is [string, ActionSchema] => entry[1].type === "action"
  );
  const expressionHooks = hooks.filter(
    (entry): entry is [string, ExpressionSchema] =>
      entry[1].type === "expression"
  );
  const declaredHooks = actionHooks.filter(
    ([, hook], index, self) =>
      index ===
      self.findIndex(([, h]) => h.from === hook.from && h.name === hook.name)
  );
  const hookDeclarationVars = declaredHooks
    .map(([, hook]): [string, Value] => [
      hookResultName(hook.name),
      { type: "function_call", arguments: [], name: hook.name },
    ])
    .concat(
      actionAndExpressions.find(([, hook]) => hook.type === "expression")
        ? [
            [
              "evaluate",
              { type: "function_call", arguments: [], name: "useExpression" },
            ],
          ]
        : []
    );

  const childrenResults = await Promise.all(
    schema.children
      .filter(
        (component): component is ComponentSchema =>
          typeof component === "object" && component.type === "component"
      )
      .map((component) => transform(component, false))
  );
  const callProps = calls.map(([name, call]) => ({
    name,
    value:
      call.type === "action"
        ? ({
            type: "function_call",
            name: call.name,
            arguments: call.properties,
          } as Value)
        : ({
            type: "function_call",
            name: "evaluate",
            arguments: [call.expression],
          } as Value),
  }));
  const hookProps = actionHooks
    .map(([name, hook]) => ({
      name,
      value: {
        type: "function_call",
        name: hookResultName(hook.name),
        arguments: hook.properties,
      } as Value,
    }))
    .concat(
      expressionHooks.map(([name, expression]) => ({
        name,
        value: {
          type: "function_call",
          name: "evaluate",
          arguments: [expression.expression],
        },
      }))
    );

  const hookImports = actionHooks.map(([, hook]) => ({
    source: hook.from,
    names: [hook.name],
    default: false,
  }));

  const variables = [
    ...hookDeclarationVars,
    ...childrenResults.flatMap((result) => result.variables),
  ];
  const jsx = {
    name: schema.name ?? toVariableName(schema.from),
    props: [...props, ...callProps, ...hookProps],
    children: childrenResults.map((result) => result.jsx),
  };

  return {
    imports: [
      ...imports_,
      ...childrenResults.flatMap((result) => result.imports),
      ...hookImports,
    ],
    variables: splitComponent ? [] : variables,
    jsx: splitComponent
      ? {
          name: (schema.name ?? toVariableName(schema.from)) + "_",
          props: [],
          children: [],
        }
      : jsx,
    additionalComponents: [
      ...(splitComponent
        ? [
            {
              name: (schema.name ?? toVariableName(schema.from)) + "_",
              props: [],
              variableDeclarations: Object.fromEntries(variables),
              JSX: [jsx],
              root: false,
            },
          ]
        : []),
      ...childrenResults.flatMap((result) => result.additionalComponents),
    ],
  };
};

export const transformIR = async (page: PageSchema): Promise<PageIR> => {
  const results = await Promise.all(
    page.children.map((component) => transform(component, true))
  );
  const imports = mergeImports(results.flatMap((r) => r.imports));
  const root = {
    name: toVariableName(page.name),
    props: [],
    variableDeclarations: Object.fromEntries(
      results.flatMap((r) => r.variables)
    ),
    JSX: results.map((r) => r.jsx),
    root: true,
  } as Component;
  const additionalComponents = results.flatMap((r) => r.additionalComponents);
  return {
    imports,
    components: [root, ...additionalComponents],
  };
};
