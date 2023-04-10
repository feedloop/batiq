import { Type } from "@sinclair/typebox";

export const replayAction = {
  type: "action",
  inputs: Type.Tuple([Type.Any()]),
  isHook: true,
  pure: true,
  root: false,
  module: {
    from: "@batiq/expo-runtime",
    name: "replayAction",
  },
};
