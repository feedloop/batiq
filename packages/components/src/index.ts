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

export const Text = {
  type: "component",
  inputs: Type.Strict(Type.Object({})),
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

export const Container = {
  inputs: Type.Strict(
    Type.Object({
      direction: Type.Union(
        [Type.Literal("vertical"), Type.Literal("horizontal")],
        {
          default: "vertical",
        }
      ),
    })
  ),
  component: {
    type: "module",
    from: "@batiq/components/elements",
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
    from: "@batiq/components/elements",
    name: "Image",
  },
};

export const Input = {
  inputs: Type.Strict(Type.Object({})),
  component: {
    type: "module",
    from: "@batiq/components/elements",
    name: "Input",
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
    from: "@batiq/components/elements",
    name: "Switch",
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
    from: "@batiq/components/elements",
    name: "RadioGroup",
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
    from: "@batiq/components/elements",
    name: "RadioItem",
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
    from: "@batiq/components/elements",
    name: "CheckBox",
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
    from: "@batiq/components/elements",
    name: "Dropdown",
  },
};

export const Carousel = {
  inputs: Type.Strict(Type.Object({})),
  component: {
    type: "module",
    from: "@batiq/components/elements",
    name: "Carousel",
  },
};
