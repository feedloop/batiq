import { Type } from "@sinclair/typebox";

export const navigate = {
  inputs: Type.Tuple([Type.String()]),
  isHook: true,
  pure: true,
  root: true,
};

export const breakpoint = {
  inputs: Type.Tuple([Type.Record(Type.String(), Type.Any())]),
  isHook: true,
  pure: true,
  root: true,
};
