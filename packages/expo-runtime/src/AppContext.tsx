import React from "react";
import { createBatiq, BaseBatiqCore, AppSchema } from "@batiq/core";
import runtimeMiddleware from "./middlewares/runtimeMiddleware";
import timeTravelMiddleware from "./middlewares/timeTravelMiddleware";
import actionRecorderMiddleware from "./middlewares/actionRecorderMiddleware";

const AppContext = React.createContext<BaseBatiqCore>(
  // @ts-ignore
  null
);

export const useBatiq = <T extends BaseBatiqCore>(): T =>
  // @ts-ignore
  React.useContext(AppContext);

export const useBatiqSchema = (): AppSchema => {
  const batiq = useBatiq();
  return React.useSyncExternalStore(batiq.subscribe, batiq.getSchema);
};

export const AppProvider = (
  props: React.PropsWithChildren<{
    schema: AppSchema;
    middlewares?: Parameters<typeof createBatiq>[1];
  }>
) => {
  const app = React.useMemo(
    () =>
      createBatiq(
        props.schema,
        // @ts-ignore
        props.middlewares ?? []
      ),
    [props.schema, props.middlewares]
  );

  return (
    <AppContext.Provider value={app}>{props.children}</AppContext.Provider>
  );
};

export const MaybeAppProvider = (
  props: React.PropsWithChildren<{
    schema: AppSchema;
    middlewares?: Parameters<typeof createBatiq>[1];
  }>
) => {
  const batiq = useBatiq();

  return batiq ? <>{props.children}</> : <AppProvider {...props} />;
};
