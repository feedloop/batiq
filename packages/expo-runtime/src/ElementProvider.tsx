import { Element } from "@batiq/ir";
import React from "react";

export const ElementSchemaContext = React.createContext<Element | null>(null);

export const useElementSchema = () => React.useContext(ElementSchemaContext);

type Props = {
  schema: Element;
};

export const ElementSchemaProvider = (
  props: React.PropsWithChildren<Props>
) => {
  return (
    <ElementSchemaContext.Provider value={props.schema}>
      {props.children}
    </ElementSchemaContext.Provider>
  );
};
