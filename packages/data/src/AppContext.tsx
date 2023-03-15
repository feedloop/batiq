import React from "react";
import {
  createBatiq,
  BaseBatiqCore,
  AppSchema,
  DataSourceDefinitionSchema,
} from "@batiq/core";

const AppContext = React.createContext<BaseBatiqCore>(
  createBatiq(
    // @ts-ignore
    {}
  )
);

export const AppProvider = (
  props: React.PropsWithChildren<{ schema: AppSchema }>
) => {
  const app = React.useMemo(() => createBatiq(props.schema), [props.schema]);
  return (
    <AppContext.Provider value={app}>{props.children}</AppContext.Provider>
  );
};

export const useBatiq = () => React.useContext(AppContext);

export const useBatiqData = (
  name: string
): DataSourceDefinitionSchema | undefined => {
  const batiq = useBatiq();
  return React.useMemo(() => batiq.getSchema()?.datasource[name], [name]);
};
