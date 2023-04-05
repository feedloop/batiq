import { Type } from "@sinclair/typebox";

export const DataSource = {
  inputs: Type.Strict(
    Type.Object({
      name: Type.String(),
      data: Type.Record(Type.String(), Type.Any()),
    })
  ),
};

export const ScopedDataSource = {
  inputs: Type.Strict(
    Type.Object({
      name: Type.String(),
      data: Type.Record(Type.String(), Type.Any()),
      component: Type.Any(),
    })
  ),
};

export const RemoveKey = {
  inputs: Type.Strict(
    Type.Object({
      key: Type.String(),
    })
  ),
};
