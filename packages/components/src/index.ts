import { Type } from "@sinclair/typebox";

export const Button = {
  type: "component",
  inputs: Type.Strict(
    Type.Object({
      to: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components/elements",
    name: "Button",
  },
};

export const Link = {
  type: "component",
  inputs: Type.Strict(
    Type.Object({
      text: Type.String(),
      to: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components/elements",
    name: "Link",
  },
};

export const Text = {
  type: "component",
  inputs: Type.Strict(
    Type.Object({
      text: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components/elements",
    name: "Text",
  },
};

export const Provider = {
  type: "component",
  inputs: Type.Strict(Type.Object({})),
  component: {
    type: "module",
    from: "@batiq/components/elements",
    name: "Provider",
  },
};
