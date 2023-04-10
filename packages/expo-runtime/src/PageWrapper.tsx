import React from "react";
import useSwr from "swr/immutable";
import { importDataSourceModule } from "@batiq/shared";
import { useBatiq } from "./AppContext";
import { useLinkBuilder, useRoute } from "@react-navigation/native";

const AuthGuard = (props: React.PropsWithChildren<{}>) => {
  const batiq = useBatiq();
  const schema = batiq.getSchema();
  const route = useRoute();
  const buildLink = useLinkBuilder();

  const currentPath = React.useMemo(
    () => buildLink(route.name, route.params),
    [route, buildLink]
  );
  const auths = React.useMemo(
    () =>
      currentPath
        ? Object.entries(schema.datasource)
            .filter(([, data]) =>
              data.authenticatedRoutes?.includes(currentPath)
            )
            .map(([name]) => name)
        : [],
    [schema, currentPath]
  );
  const { data: isAuthenticated } = useSwr([batiq, schema, auths], async () => {
    const results = await Promise.all(
      auths.map((name) =>
        importDataSourceModule(schema, name).then((data) =>
          data.isAuthenticated(batiq)
        )
      )
    );

    return results.every((result) => result);
  });

  // return isAuthenticated ? props.children : null;
  return <>{props.children}</>;
};

export const PageWrapper = (props: React.PropsWithChildren<{}>) => {
  return (
    <React.Suspense fallback="Loading Page">
      <AuthGuard>{props.children}</AuthGuard>
    </React.Suspense>
  );
};
