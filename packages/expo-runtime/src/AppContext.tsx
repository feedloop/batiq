import React, { PropsWithChildren } from "react";
import { createBatiq, BaseBatiqCore, AppSchema, PageSchema } from "@batiq/core";
import { NavigationContainer, PathConfigMap } from "@react-navigation/native";
import { Runtime } from "./middlewares/runtimeMiddleware";
import { navigationRef } from "./Navigation";

const AppContext = React.createContext<BaseBatiqCore>(
  // @ts-ignore
  null
);

export const useBatiq = <T extends BaseBatiqCore>(): T =>
  // @ts-ignore
  React.useContext(AppContext);

export const useBatiqSchema = (): AppSchema => {
  const batiq = useBatiq();
  return React.useSyncExternalStore(batiq.subscribe, batiq.getSchema);
};

export const AppProvider = (
  props: React.PropsWithChildren<{
    schema: AppSchema;
    middlewares?: Parameters<typeof createBatiq>[1];
    importMaps?: Record<string, React.ComponentType>;
  }>
) => {
  const app = React.useMemo(
    () =>
      createBatiq(
        props.schema,
        // @ts-ignore
        props.middlewares ?? []
      ),
    [props.schema, props.middlewares]
  );
  return (
    <AppContext.Provider value={app}>
      <AppNavigationContainer>{props.children}</AppNavigationContainer>
    </AppContext.Provider>
  );
};

type Page = {
  name: string;
  route: string;
};

type Tab = {
  tab: NonNullable<PageSchema["navigation"]["tab"]>;
  page: Page | Page[];
};

type Navigation = {
  tabs: Record<string, Tab>;
  stack: Page[];
};

export const toNavigation = (pages: PageSchema[]): Navigation =>
  pages.reduce(
    (navigation: Navigation, page: PageSchema): Navigation => {
      if (!page.navigation.tab) {
        return {
          ...navigation,
          stack: [
            ...navigation.stack,
            { name: page.name, route: page.navigation.path },
          ],
        };
      }
      const tab = navigation.tabs[page.navigation.tab.label];
      return {
        ...navigation,
        tabs: {
          ...navigation.tabs,
          [page.navigation.tab.label]: tab
            ? {
                ...tab,
                page: [
                  ...(Array.isArray(tab.page) ? tab.page : [tab.page]),
                  {
                    name: page.name,
                    route: page.navigation.path,
                  },
                ],
              }
            : {
                tab: page.navigation.tab,
                page: {
                  name: page.name,
                  route: page.navigation.path,
                },
              },
        },
      };
    },
    { tabs: {}, stack: [] }
  );

const AppNavigationContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const batiq = useBatiq<BaseBatiqCore & Runtime>();
  const schema = useBatiqSchema();
  const { tabs, stack } = React.useMemo(() => {
    return toNavigation(schema.pages);
  }, [schema.pages]);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={{
        prefixes: schema.config.link_prefixes ?? [],
        config: {
          screens: {
            Tabs: {
              screens: Object.fromEntries(
                Object.entries(tabs).map(([label, tab]) => [
                  label,
                  Array.isArray(tab.page)
                    ? ({
                        screens: Object.fromEntries(
                          tab.page.map((page) => [page.name, page.route])
                        ),
                      } as const)
                    : tab.page.route,
                ])
              ),
            },
            ...(Object.fromEntries(
              stack.map((page) => [page.name, page.route])
            ) as PathConfigMap<{}>),
          } as any,
        },
      }}
      onStateChange={(state) => state && batiq.onNavigate(state)}
      onReady={() => batiq.onNavigate(navigationRef.getRootState())}
    >
      {children}
    </NavigationContainer>
  );
};

export const MaybeAppProvider = (
  props: React.PropsWithChildren<{
    schema: AppSchema;
    middlewares?: Parameters<typeof createBatiq>[1];
  }>
) => {
  const batiq = useBatiq();

  return batiq ? <>{props.children}</> : <AppProvider {...props} />;
};
