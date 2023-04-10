import { Type } from "@sinclair/typebox";

export const navigate = {
  type: "component",
  isHook: true,
  pure: true,
  root: false,
  module: {
    from: "@batiq/actions/module",
    name: "navigate",
  },
};

export const goBack = {
  type: "component",
  isHook: true,
  pure: true,
  root: false,
  module: {
    from: "@batiq/actions/module",
    name: "goBack",
  },
};

export const breakpoint = {
  type: "component",
  inputs: Type.Tuple([Type.Record(Type.String(), Type.Any())]),
  isHook: true,
  pure: true,
  root: false,
  module: {
    from: "@batiq/actions/module",
    name: "breakpoint",
  },
};
