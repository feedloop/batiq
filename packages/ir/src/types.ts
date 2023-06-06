import { Container } from "@batiq/core";

export type ComponentImport = {
  source: string;
  names: string[];
  default: string | null;
};

export type FunctionCall = {
  type: "function_call";
  object?: Value;
  name: string;
  arguments: Container<Primitive>[];
};

export type FunctionDefinition = {
  type: "function_definition";
  async?: boolean;
  name?: string;
  parameters: string[];
  return: Value;
};

export type Variable = {
  type: "variable";
  name: string;
};

export type BinaryOperator = {
  type: "binary_operator";
  operator: // Binary Expression
  | "+"
    | "-"
    | "/"
    | "%"
    | "*"
    | "**"
    | "&"
    | "|"
    | ">>"
    | ">>>"
    | "<<"
    | "^"
    | "=="
    | "==="
    | "!="
    | "!=="
    | "in"
    | "instanceof"
    | ">"
    | "<"
    | ">="
    | "<="
    | "|>"

    // Logical
    | "||"
    | "&&"
    | "??";
  left: Value;
  right: Value;
};

export type JSON = {
  type: "json";
  value: Record<string, any>;
};

export type Primitive = string | number | boolean;
export type Value = Container<
  | FunctionDefinition
  | FunctionCall
  | Variable
  | BinaryOperator
  | Element
  | JSON
  | Primitive
>;

export type Element = {
  type: "element";
  name: string | string[];
  metadata: {
    path?: (string | number)[];
    isLeaf?: boolean;
  };
  props: { name: string; value: Value }[];
  children: JSX[];
};

export type RenderProp = {
  type: "render_prop";
  parameters: string[];
  JSX: JSX;
};

export type JSXExpression = {
  type: "jsx_expression";
  value: Value;
};
export type JSX = Element | RenderProp | JSXExpression | Primitive;

export type Component = {
  name: string;
  variableDeclarations: Record<string, Value>;
  JSX: JSX[];
  root: boolean;
};

export type PageIR = {
  imports: ComponentImport[];
  variableDeclarations: Record<string, Value>;
  components: Component[];
};
