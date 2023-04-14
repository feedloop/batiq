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

export const Container = {
  inputs: Type.Strict(
    Type.Object({
      direction: Type.Union(["vertical", "horizontal"], {
        default: "vertical",
      }),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};

export const Image = {
  inputs: Type.Strict(
    Type.Object({
      src: Type.String({}),
      fallbackSrc: Type.String({}),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};

export const Input = {
  inputs: Type.Strict(Type.Object({})),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};

export const Switch = {
  inputs: Type.Strict(
    Type.Object({
      initialValue: Type.Boolean({ default: false }),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};

export const RadioGroup = {
  inputs: Type.Strict(
    Type.Object({
      name: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};

export const RadioItem = {
  inputs: Type.Strict(
    Type.Object({
      value: Type.Any(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};

export const CheckBox = {
  inputs: Type.Strict(
    Type.Object({
      initialValue: Type.String(),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};

export const Dropdown = {
  inputs: Type.Strict(
    Type.Object({
      wrapperProps: Type.Object({}),
      itemProps: Type.Object({}),
      values: Type.Array(
        Type.Object({ label: Type.String(), value: Type.Any() })
      ),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components",
    name: "Container",
  },
};
