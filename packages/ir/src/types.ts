import { Container } from "@batiq/core";

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

type Primitive = string | number | boolean;
export type Value = Container<
  FunctionCall | Variable | BinaryOperator | Element | Primitive
>;

export type Element = {
  type: "element";
  name: string | string[];
  props: { name: string; value: Value }[];
  children: JSX[];
};

export type RenderProp = {
  type: "render_prop";
  parameters: string[];
  JSX: JSX;
};

export type JSX = Element | RenderProp | Primitive;

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
