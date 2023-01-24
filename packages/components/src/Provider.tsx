import { ComponentDefinition } from "@batiq/core";
import { NativeBaseProvider } from "native-base";

// @ts-ignore
export const Provider: ComponentDefinition<{}> = NativeBaseProvider;
Provider.inputs = {
  type: "object",
  properties: {},
};
