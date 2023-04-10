import React from "react";
import { useBatiq } from "@batiq/expo-runtime";
import { importDataSourceModule } from "@batiq/shared";

export const authenticate = () => {
  const batiq = useBatiq();
  const schema = batiq.getSchema();

  return React.useCallback(
    async (datasourceName: string, params: any) => {
      const data = await importDataSourceModule(schema, datasourceName);

      return data.authenticate(batiq, params);
    },
    [schema]
  );
};
