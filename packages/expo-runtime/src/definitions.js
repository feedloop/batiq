import { Type } from "@sinclair/typebox";

export const AppProvider = {
  inputs: Type.Strict(
    Type.Object({
      schema: Type.Record(Type.String(), Type.Any()),
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
