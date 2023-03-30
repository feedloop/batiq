import { Type } from "@sinclair/typebox";

export const replayAction = {
  inputs: Type.Tuple([Type.Any()]),
  isHook: true,
  pure: true,
  root: false,
};
