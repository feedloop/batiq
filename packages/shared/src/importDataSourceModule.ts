import {
  AppSchema,
  DataSource as DataSourceConfig,
  DataSourceDefinitionSchema,
} from "@batiq/core";
import { importModule } from "./importModule";

export const importDataSourceModule = async (
  schema: AppSchema,
  datasourceName: string
) => {
  const dataConfig = schema.datasource?.[datasourceName];
  if (!dataConfig) {
    throw new Error(`data source '${datasourceName}' is not defined`);
  }
  const importSource =
    typeof dataConfig.type === "object"
      ? dataConfig.type
      : dataConfig.type === "local"
      ? {
          from: "@batiq/data",
          name: "Local",
        }
      : dataConfig.type === "qore"
      ? {
          from: "@batiq/data",
          name: "Qore",
        }
      : {
          from: "@batiq/data",
          name: "OpenAPI",
        };
  const datasourceConstructor = await importModule(importSource.from).then(
    (
      module: any
    ): ((data: DataSourceDefinitionSchema) => Promise<DataSourceConfig>) => {
      if (!(importSource.name in module)) {
        throw new Error(
          `data source '${importSource.name}' is exported in ${importSource.from}`
        );
      }
      return module[importSource.name];
    }
  );
  if (!datasourceConstructor) {
    throw new Error(`data source '${datasourceName}' is not defined`);
  }
  return datasourceConstructor(dataConfig);
};
