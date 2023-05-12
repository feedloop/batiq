import React from "react";
import useSwr from "swr/immutable";
import { useBatiq } from "./AppContext";
import { importDataSourceModule } from "@batiq/import-helper";
import { withData } from "./DataProvider";
import { Text } from "react-native";

type Props = {
  data: string;
  name: string;
  query: Record<string, any>;
};

const Query_ = (
  props: React.PropsWithChildren<{
    datasourceName: string;
    name: string;
    query: Record<string, any>;
  }>
) => {
  const batiq = useBatiq();
  const { data } = useSwr(
    [batiq.getSchema(), props.datasourceName],
    ([schema, name]) => importDataSourceModule(schema, name),
    {
      suspense: true,
    }
  );
  const DataComponent = data && withData(data.component);

  return DataComponent ? (
    <DataComponent name={props.name} query={props.query}>
      {props.children}
    </DataComponent>
  ) : null;
};

export const Query = (props: React.PropsWithChildren<Props>) => {
  return (
    <React.Suspense fallback={<Text>Loading Data</Text>}>
      <Query_ datasourceName={props.data} name={props.name} query={props.query}>
        {props.children}
      </Query_>
    </React.Suspense>
  );
};
