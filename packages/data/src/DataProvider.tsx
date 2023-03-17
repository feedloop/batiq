import React from "react";
import { Static } from "@sinclair/typebox";
import * as definitions from "./definitions";

const DataContext = React.createContext<Record<string, any>>({});

export const useDataContext = () => React.useContext(DataContext);

export const DataSource = (
  props: React.PropsWithChildren<Static<typeof definitions.DataSource.inputs>>
) => {
  const parentData = React.useContext(DataContext);
  const data = React.useMemo(
    () => ({ ...parentData, [props.name]: props.data }),
    [parentData, props.name, props.data]
  );
  return (
    <DataContext.Provider value={data}>{props.children}</DataContext.Provider>
  );
};

export const RemoveKey = (
  props: React.PropsWithChildren<Static<typeof definitions.RemoveKey.inputs>>
) => {
  const parentData = React.useContext(DataContext);
  const data = React.useMemo(() => {
    const { [props.key]: _, ...rest } = parentData;
    return parentData;
  }, [parentData, props.key]);
  return (
    <DataContext.Provider value={data}>{props.children}</DataContext.Provider>
  );
};

export const ScopedDataSource = (
  props: React.PropsWithChildren<
    Static<typeof definitions.ScopedDataSource.inputs>
  >
) => {
  const children = <RemoveKey key={props.name}>{props.children}</RemoveKey>;
  return (
    <DataSource name={props.name} data={props.data}>
      {props.component}
    </DataSource>
  );
};

/**
 * Higher-order component that enables component to provide data to its
 * children with hook-like API.
 */
let overrides: { [key: string]: any } = {};
export function withData<P = any>(renderFunc: React.FunctionComponent<P>) {
  return (props: P) => {
    overrides = {};
    const wrappedComponent = renderFunc(props);
    const data = React.useContext(DataContext);
    const newData = React.useMemo(
      () => ({ ...data, ...overrides }),
      [data, overrides]
    );
    overrides = {};
    return Object.keys(overrides).length > 0 ? (
      <DataContext.Provider value={newData}>
        {wrappedComponent}
      </DataContext.Provider>
    ) : (
      wrappedComponent
    );
  };
}

export const useData = (name: string, data: Record<string, any>) => {
  overrides[name] = data;
};
