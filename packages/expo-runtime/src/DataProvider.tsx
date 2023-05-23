import React from "react";
import useSwr from "swr/immutable";
import { useId } from "./PathProvider";
import { useGlobalState } from "./useGlobalState";
import { Text } from "react-native";

const DataContext = React.createContext<Record<string, any>>({});

export const useDataContext = () => React.useContext(DataContext);

export const DataSource = (
  props: React.PropsWithChildren<{
    name: string;
    data: Record<string, any> | (() => Promise<Record<string, any>>);
  }>
) => {
  const parentData = React.useContext(DataContext);
  const mergedData = React.useMemo(
    () => ({ ...parentData, [props.name]: props.data }),
    [parentData, props.name, props.data]
  );
  return (
    <DataContext.Provider value={mergedData}>
      {props.children}
    </DataContext.Provider>
  );
};

export const RemoveKey = (props: React.PropsWithChildren<{ name: string }>) => {
  const parentData = React.useContext(DataContext);
  const data = React.useMemo(() => {
    const { [props.name]: _, ...rest } = parentData;
    return rest;
  }, [parentData, props.name]);
  return (
    <DataContext.Provider value={data}>{props.children}</DataContext.Provider>
  );
};

export const ScopedDataSource = (
  props: React.PropsWithChildren<{
    name: string;
    data: Record<string, any>;
    component: React.ReactNode;
  }>
) => {
  const children = <RemoveKey name={props.name}>{props.children}</RemoveKey>;
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
    return (
      <React.Suspense fallback={<Text>Loading data</Text>}>
        {Object.keys(newData).length > 0 ? (
          <DataContext.Provider value={newData}>
            {wrappedComponent}
          </DataContext.Provider>
        ) : (
          wrappedComponent
        )}
      </React.Suspense>
    );
  };
}

export const useData = (
  name: string,
  data: Record<string, any> | (() => Promise<Record<string, any>>),
  cacheKey?: any[]
) => {
  const id = useId();
  const keyRef = React.useRef(cacheKey ?? [Math.random()]);
  const defaultValue = data;
  const isLazy = typeof defaultValue === "function";
  const [cachedData, setData] = useGlobalState(
    id,
    isLazy ? undefined : defaultValue
  );
  const result = useSwr(
    keyRef.current,
    () => {
      return isLazy ? defaultValue() : defaultValue;
    },
    {
      isPaused: () => !isLazy || cachedData,
      fallbackData: cachedData,
    }
  );
  React.useEffect(() => {
    setData(result.data);
  }, [result.data]);
  const parentData = React.useContext(DataContext);
  const mergedData = React.useMemo(
    () => (result.data ? { ...parentData, [name]: cachedData } : parentData),
    [parentData, name, cachedData]
  );

  overrides = mergedData;

  return result;
};
