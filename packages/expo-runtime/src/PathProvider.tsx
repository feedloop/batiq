import React from "react";

export const PathContext = React.createContext<number[]>([]);

export const usePath = () => React.useContext(PathContext);

export const useId = (id?: string) => {
  const path = usePath();
  return id ? `${path}/${id}` : path.join(".");
};

type Props = {
  index: number;
};

export const PathProvider = (props: React.PropsWithChildren<Props>) => {
  const path = usePath();
  const newPath = React.useMemo(
    () => [...path, props.index],
    [path, props.index]
  );

  return (
    <PathContext.Provider value={newPath}>
      {props.children}
    </PathContext.Provider>
  );
};
