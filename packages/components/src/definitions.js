import { Type } from "@sinclair/typebox";

export const Button = {
  inputs: Type.Strict(
    Type.Object({
      to: Type.String(),
    })
  ),
};

export const Link = {
  inputs: Type.Strict(
    Type.Object({
      text: Type.String(),
      to: Type.String(),
    })
  ),
};

export const Text = {
  inputs: Type.Strict(
    Type.Object({
      text: Type.String(),
    })
  ),
};

export const Provider = {
  inputs: Type.Strict(Type.Object({})),
};
