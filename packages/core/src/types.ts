import * as React from "react";
import { JSONSchemaType } from "ajv";
import { Path } from "./lens";
import { TTuple, TArray } from "@sinclair/typebox";

export type ComponentDefinitionType = "compound" | "module";

export type ComponentDefinition<
  T extends ComponentDefinitionType = ComponentDefinitionType,
  P extends Record<string, any> = Record<string, any>
> = {
  type: "component";
  inputs?: Record<string, any>;
  schema: ComponentInput<P>;
  definitions: {
    kind: "block" | "text" | "void";
  };
  component: T extends "compound"
    ? CompoundComponentSchema
    : ModuleComponentSchema;
};

export type ModuleComponentSchema = {
  type: "module";
  from: string;
  name?: string;
};

export type DataSourceDefinition<P extends Record<string, any>> =
  ComponentDefinition<
    ComponentDefinitionType,
    {
      name: string;
      query: P;
    }
  >;

type QueryResult<T> =
  | {
      type: "single";
      data: T;
    }
  | {
      type: "list";
      data: T[];
    };

export type DataSource<
  P extends Record<string, any> = Record<string, any>,
  Data = any
> = {
  isAuthenticated: <T extends BaseBatiqCore>(batiq: T) => Promise<boolean>;
  authenticate: <T extends BaseBatiqCore>(
    batiq: T,
    params: any
  ) => Promise<any>;
  logout: <T extends BaseBatiqCore>(batiq: T) => Promise<void>;
  definition: DataSourceDefinition<P>;
  query: (query: P) => Promise<QueryResult<Data>>;
  component: (
    props: React.PropsWithChildren<{ name: string; query: P }>
  ) => React.ReactElement;
};

export type ComponentInput<P> = JSONSchemaType<P>;

export type ComponentSchema = {
  type: "component";
  from: string;
  name?: string;
  properties: Record<string, Property>;
  overrideProperties?: Record<string, Record<string, Property>>;
  overrideComponents?: Record<string, ComponentSchema>;
  children: Primitive[];
};

export type SlotSchema = { type: "slot" };

export type CompoundComponentSchema = Omit<ComponentSchema, "children"> & {
  id?: string;
  children: (
    | Exclude<Primitive, { type: "component" }>
    | CompoundComponentSchema
    | SlotSchema
  )[];
};

export type ActionDefinition<S extends TTuple | TArray = TTuple<[]>> =
  | {
      type: "action";
      inputs: S;
      returns?: string | string[];
      isHook?: true; // if set, treat action as a hook/not, otherwise infer from its name.
      pure?: boolean; // when then action is a hook and impure, multiple hook calls with the same name will be called separately.
      root?: boolean; // if set, treat action as a root action, otherwise infer from its name.
      module: {
        from: string;
        name: string;
      };
    }
  | {
      type: "action";
      inputs: S;
      returns?: string | string[];
      isHook?: false; // if set, treat action as a hook/not, otherwise infer from its name.
      module: {
        from: string;
        name: string;
      };
    };

export type ActionSchema = {
  type: "action";
  from: string;
  name: string;
  id?: string;
  arguments: Container<Primitive | ActionSchema | ExpressionSchema>[];
  next?: string | number;
  onError?: string | number;
};

export type ExpressionSchema = {
  type: "expression";
  expression: string;
};

export type DataSchema = {
  type: "data";
  data: string;
  name: string;
  query: Record<string, any>;
  children: ComponentSchema["children"];
};

export type BreakpointSchema<T> = {
  type: "breakpoint";
  breakpoints: Record<string, T>;
};

export type Primitive =
  | ComponentSchema
  | ExpressionSchema
  | DataSchema
  | SlotSchema // TODO: remove this
  | string
  | number
  | boolean;
export type Container<T> =
  | T
  | Container<T>[]
  | { [key in string extends "type" ? never : string]: Container<T> };
export type Value = Container<Primitive>;
export type Property =
  | Container<Primitive | ActionSchema>
  | BreakpointSchema<Container<Primitive | ExpressionSchema | ActionSchema>>;

export type PageSchema = {
  name: string;
  navigation: {
    path: string;
    tab?: {
      label: string;
      icon: string;
    };
  };
  children: Primitive[];
};

export type Platform = "web" | "native" | "webcomponent";

export type DataSourceDefinitionSchema = {
  type:
    | "qore"
    | "local"
    | "openapi"
    | {
        from: string;
        name: string;
      };
  config: Record<string, any>;
  authenticatedRoutes?: string[];
};

export type FontStyle = {
  fontFamily: string;
  fontWeight:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
};

// export type LocalCompoundComponent = {
//   definitions: ComponentDefinition;
//   component: CompoundComponentSchema;
// };

export type AppSchema = {
  batiq: string;
  platform: Platform;
  info: Record<string, any> & {
    name: string;
    description?: string;
    version?: string;
    tags?: {
      name: string;
      description?: string;
    }[];
  };
  config: Record<string, any> & {
    link_prefixes?: string[];
  };
  datasource: Record<string, DataSourceDefinitionSchema>;
  components: Record<string, ComponentDefinition>;
  theme?: Partial<{
    dark: boolean;
    colors: Partial<{
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    }>;
    fonts: {
      [platform: string]: {
        regular: FontStyle;
        medium: FontStyle;
        bold: FontStyle;
        heavy: FontStyle;
      };
    };
    breakpoints: {
      [key: string]: number;
    };
    [key: string]: any;
  }>;
  pages: PageSchema[];
};

export type Middleware<
  S extends BaseBatiqCore = BaseBatiqCore,
  O extends S = S
> = (batiq: S) => O;

export type Operation<S> =
  | { type: "insert"; path: Path<S>; value: unknown }
  | { type: "remove"; path: Path<S> }
  | { type: "set"; path: Path<S>; value: unknown }
  | { type: "move"; from: Path<S>; to: Path<S> };

export type AppOperation = Operation<AppSchema>;

export type BaseBatiqCore = {
  operations: AppOperation[];
  dispatch: (operations: AppOperation | AppOperation[]) => void;
  getSchema: () => AppSchema;
  subscribe: (listener: (operations: AppOperation[]) => void) => () => void;
};

/**
 * factory function to create a batiq instance, middlewares type
 * is limited to 10. Fortunately middleware is composable,
 * if you want more than 10 middlewares you should compose
 * them into a single middleware
 */
export interface CreateBatiqFn {
  (json: AppSchema): BaseBatiqCore;
  (json: AppSchema, middlewares: []): BaseBatiqCore;
  <O1 extends BaseBatiqCore>(
    json: AppSchema,
    middlewares: [Middleware<BaseBatiqCore, O1>]
  ): O1;
  <O1 extends BaseBatiqCore, O2 extends O1>(
    json: AppSchema,
    middlewares: [Middleware<BaseBatiqCore, O1>, Middleware<O1, O2>]
  ): O2;
  <O1 extends BaseBatiqCore, O2 extends O1, O3 extends O2>(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>
    ]
  ): O3;
  <O1 extends BaseBatiqCore, O2 extends O1, O3 extends O2, O4 extends O3>(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>,
      Middleware<O3, O4>
    ]
  ): O4;
  <
    O1 extends BaseBatiqCore,
    O2 extends O1,
    O3 extends O2,
    O4 extends O3,
    O5 extends O4
  >(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>,
      Middleware<O3, O4>,
      Middleware<O4, O5>
    ]
  ): O5;
  <
    O1 extends BaseBatiqCore,
    O2 extends O1,
    O3 extends O2,
    O4 extends O3,
    O5 extends O4,
    O6 extends O5
  >(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>,
      Middleware<O3, O4>,
      Middleware<O4, O5>,
      Middleware<O5, O6>
    ]
  ): O6;
  <
    O1 extends BaseBatiqCore,
    O2 extends O1,
    O3 extends O2,
    O4 extends O3,
    O5 extends O4,
    O6 extends O5,
    O7 extends O6
  >(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>,
      Middleware<O3, O4>,
      Middleware<O4, O5>,
      Middleware<O5, O6>,
      Middleware<O6, O7>
    ]
  ): O7;
  <
    O1 extends BaseBatiqCore,
    O2 extends O1,
    O3 extends O2,
    O4 extends O3,
    O5 extends O4,
    O6 extends O5,
    O7 extends O6,
    O8 extends O7
  >(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>,
      Middleware<O3, O4>,
      Middleware<O4, O5>,
      Middleware<O5, O6>,
      Middleware<O6, O7>,
      Middleware<O7, O8>
    ]
  ): O8;
  <
    O1 extends BaseBatiqCore,
    O2 extends O1,
    O3 extends O2,
    O4 extends O3,
    O5 extends O4,
    O6 extends O5,
    O7 extends O6,
    O8 extends O7,
    O9 extends O8
  >(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>,
      Middleware<O3, O4>,
      Middleware<O4, O5>,
      Middleware<O5, O6>,
      Middleware<O6, O7>,
      Middleware<O7, O8>,
      Middleware<O8, O9>
    ]
  ): O9;
  <
    O1 extends BaseBatiqCore,
    O2 extends O1,
    O3 extends O2,
    O4 extends O3,
    O5 extends O4,
    O6 extends O5,
    O7 extends O6,
    O8 extends O7,
    O9 extends O8,
    O10 extends O9
  >(
    json: AppSchema,
    middlewares: [
      Middleware<BaseBatiqCore, O1>,
      Middleware<O1, O2>,
      Middleware<O2, O3>,
      Middleware<O3, O4>,
      Middleware<O4, O5>,
      Middleware<O5, O6>,
      Middleware<O6, O7>,
      Middleware<O7, O8>,
      Middleware<O8, O9>,
      Middleware<O9, O10>
    ]
  ): O10;
}
