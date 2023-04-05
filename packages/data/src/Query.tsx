import React from "react";
import useSwr from "swr/immutable";
import { useBatiq } from "@batiq/expo-runtime";
// @ts-ignore TODO: fix this
import { importDataSourceModule } from "@batiq/shared";

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

  return data ? (
    <data.component name={props.name} query={props.query}>
      {props.children}
    </data.component>
  ) : null;
};

export const Query = (props: React.PropsWithChildren<Props>) => {
  return (
    <React.Suspense fallback="Loading Data">
      <Query_ datasourceName={props.data} name={props.name} query={props.query}>
        {props.children}
      </Query_>
    </React.Suspense>
  );
};
