import { ActionDefinition } from "@batiq/core";
import { TTuple, TArray, Type, Static } from "@sinclair/typebox";

interface DefineAction {
  <S extends TTuple | TArray>(
    definitions: {
      inputs: S;
      isHook?: true;
      impure: boolean;
      root: boolean;
    },
    action: () => (...args: Static<S>) => void | Promise<void>
  ): ActionDefinition<S>;
  <S extends TTuple | TArray>(
    definitions: {
      inputs: S;
      isHook?: false;
    },
    action: (...args: Static<S>) => void | Promise<void>
  ): ActionDefinition<S>;
}
const defineAction: DefineAction = (definitions, action) =>
  Object.assign(action, definitions) as any;

export const navigate = defineAction(
  {
    inputs: Type.Tuple([Type.String()]),
    isHook: true,
    impure: false,
    root: false,
  },
  () => (path) => {
    // navigate
  }
);
