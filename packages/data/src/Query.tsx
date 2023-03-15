import React from "react";
import {
  DataSource as DataSourceConfig,
  DataSourceDefinitionSchema,
} from "@batiq/core";
import { useBatiqData } from "./AppContext";
import useSwr from "swr/immutable";

const importDataModule = (source: string, name: string) => {
  const fromName = (
    module: any
  ): ((data: DataSourceDefinitionSchema) => Promise<DataSourceConfig>) => {
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
  const { data: datasourceConstructor } = useSwr(
    [props.dataConfig],
    async () => {
      return typeof props.dataConfig.type === "object"
        ? importDataModule(
            props.dataConfig.type.from,
            props.dataConfig.type.name
          )
        : Promise.reject();
    },
    { suspense: true }
  );
  const { data } = useSwr(
    [datasourceConstructor, props.dataConfig.config],
    () => datasourceConstructor?.(props.dataConfig),
    { suspense: true }
  );

  return data ? (
    <data.component name={props.name} query={props.query}>
      {props.children}
    </data.component>
  ) : null;
};

export const Query = (props: React.PropsWithChildren<Props>) => {
  const data = useBatiqData(props.data);

  return data ? (
    <React.Suspense fallback="Loading datasource">
      <Query_ dataConfig={data} name={props.name} query={props.query}>
        {props.children}
      </Query_>
    </React.Suspense>
  ) : null;
};
