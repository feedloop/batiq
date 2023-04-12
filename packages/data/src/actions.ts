import React from "react";
import { useBatiq } from "@batiq/expo-runtime";
import { importDataSourceModule } from "@batiq/import-helper";

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

export const logout = () => {
  const batiq = useBatiq();
  const schema = batiq.getSchema();

  return React.useCallback(
    async (datasourceName: string) => {
      const data = await importDataSourceModule(schema, datasourceName);

      return data.logout(batiq);
    },
    [schema]
  );
};
