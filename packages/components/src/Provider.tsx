import { ComponentDefinition } from "@batiq/core";
import { NativeBaseProvider } from "native-base";
import { Static, Type } from "@sinclair/typebox";

const inputs = Type.Strict(Type.Object({}));
type T = Static<typeof inputs>;

export const Provider: ComponentDefinition<T> = (props: T) => (
  <NativeBaseProvider {...props} />
);
// @ts-ignore
Provider.inputs = inputs;
