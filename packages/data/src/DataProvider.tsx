import React from "react";

const DataContext = React.createContext<Record<string, any>>({});

type Props = {
  name: string;
  data: Record<string, any>;
};

export const DataSource = (props: React.PropsWithChildren<Props>) => {
  const parentData = React.useContext(DataContext);
  const data = React.useMemo(
    () => ({ ...parentData, [props.name]: props.data }),
    [parentData, props.name, props.data]
  );
  return (
    <DataContext.Provider value={data}>{props.children}</DataContext.Provider>
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
