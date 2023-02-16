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

type Primitive = string | number | boolean;
export type Value = Container<FunctionCall | Element | Primitive>;

export type Element = {
  type: "element";
  name: string;
  props: { name: string; value: Value }[];
  children: JSX[];
};

export type JSX = Element | Primitive;

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
