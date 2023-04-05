import { Type } from "@sinclair/typebox";

export const Button = {
  inputs: Type.Strict(
    Type.Object({
      to: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Button",
  },
};

export const Link = {
  inputs: Type.Strict(
    Type.Object({
      text: Type.String(),
      to: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Link",
  },
};

export const Text = {
  inputs: Type.Strict(
    Type.Object({
      text: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Text",
  },
};

export const Provider = {
  inputs: Type.Strict(Type.Object({})),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Provider",
  },
};
