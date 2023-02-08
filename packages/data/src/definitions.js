import { Type } from "@sinclair/typebox";

export const DataSource = {
  inputs: Type.Strict(
    Type.Object({
      name: Type.String(),
      data: Type.Record(Type.String(), Type.Any()),
    })
  ),
};
