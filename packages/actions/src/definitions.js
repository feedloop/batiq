import { Type } from "@sinclair/typebox";

export const navigate = {
  isHook: true,
  pure: true,
  root: false,
};

export const goBack = {
  isHook: true,
  pure: true,
  root: false,
};

export const breakpoint = {
  inputs: Type.Tuple([Type.Record(Type.String(), Type.Any())]),
  isHook: true,
  pure: true,
  root: false,
};
