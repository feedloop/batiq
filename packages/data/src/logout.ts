import React from "react";
import { useBatiq } from "@batiq/expo-runtime";
import { importDataSourceModule } from "@batiq/shared";

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
