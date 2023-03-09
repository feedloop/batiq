import React from "react";
import {
  DataSource as DataSourceConfig,
  DataSourceDefinitionSchema,
} from "@batiq/core";
import { useBatiqData } from "./AppContext";

const importDataModule = (source: string, name: string) => {
  const fromName = (module: any): DataSourceConfig => {
    if (!(name in module)) {
      throw new Error(`data source '${name}' is exported in ${source}`);
    }
    return module[name];
  };
  switch (source) {
    case "@batiq/data":
      return import("./").then(fromName);

    default:
      import(source).then(fromName);
  }
};

const suspense = <T,>(promise: () => Promise<T>): T | undefined => {
  let status = "pending";
  let result: T | undefined;
  const suspend = promise().then(
    (res) => {
      status = "success";
      result = res;
    },
    (err) => {
      status = "error";
      result = err;
    }
  );
  switch (status) {
    case "pending":
      throw suspend;

    case "success":
      return result;

    case "error":
    default:
      throw result;
  }
};

type Props = {
  data: string;
  name: string;
  query: Record<string, any>;
};

const Query_ = (
  props: React.PropsWithChildren<{
    dataConfig: DataSourceDefinitionSchema;
    name: string;
    query: Record<string, any>;
  }>
) => {
  const data = suspense(() =>
    typeof props.dataConfig.type === "object"
      ? importDataModule(props.dataConfig.type.from, props.dataConfig.type.name)
      : Promise.reject()
  );

  return data ? <data.component query={props.query}></data.component> : null;
};

export const Query = (props: React.PropsWithChildren<Props>) => {
  const data = useBatiqData(props.name);
};
