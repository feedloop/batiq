import { Type } from "@sinclair/typebox";

export const navigate = {
  inputs: Type.Tuple([Type.String()]),
  isHook: true,
  pure: true,
  root: true,
};
