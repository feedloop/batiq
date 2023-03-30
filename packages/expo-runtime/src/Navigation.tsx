import React from "react";
import { BaseBatiqCore, PageSchema } from "@batiq/core";
import {
  createNavigationContainerRef,
  NavigationContainer,
  PathConfigMap,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useBatiq, useBatiqSchema } from "./AppContext";
import { Runtime } from "./middlewares/runtimeMiddleware";

type Page = {
  component: React.ComponentType;
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

const toPage = (
  page: PageSchema,
  importMaps: Record<string, React.ComponentType>
): Page => {
  const component = importMaps[page.navigation.path];
  if (!component) {
    throw new Error(`Could not find import path for ${page.name}`);
  }
  return {
    component,
    name: page.name,
    route: page.navigation.path,
  };
};

export const toNavigation = (
  pages: PageSchema[],
  importMaps: Record<string, React.ComponentType>
): Navigation =>
  pages.reduce(
    (navigation: Navigation, page: PageSchema): Navigation => {
      if (!page.navigation.tab) {
        return {
          ...navigation,
          stack: [...navigation.stack, toPage(page, importMaps)],
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
                  toPage(page, importMaps),
                ],
              }
            : { tab: page.navigation.tab, page: toPage(page, importMaps) },
        },
      };
    },
    { tabs: {}, stack: [] }
  );

const createTabs = (tabs: Navigation["tabs"]) => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
      {Object.entries(tabs).map(([label, tab]) => {
        const { page } = tab;
        if (Array.isArray(page)) {
          const Stack = createNativeStackNavigator();
          return (
            <Tab.Screen
              name={label}
              options={{
                headerShown: false,
              }}
            >
              {() => (
                <Stack.Navigator>
                  {page.map((p) => (
                    <Stack.Screen name={p.name} component={p.component} />
                  ))}
                </Stack.Navigator>
              )}
            </Tab.Screen>
          );
        } else {
          return <Tab.Screen name={label} component={page.component} />;
        }
      })}
    </Tab.Navigator>
  );
};

export const navigationRef = createNavigationContainerRef();

export const Navigation = (props: {
  importMaps: Record<string, React.ComponentType>;
}) => {
  const batiq = useBatiq<BaseBatiqCore & Runtime>();
  const schema = useBatiqSchema();
  const { tabs, stack } = React.useMemo(() => {
    return toNavigation(schema.pages, props.importMaps);
  }, [schema.pages, props.importMaps]);

  const Stack = React.useMemo(createNativeStackNavigator, []);
  const Tab = React.useCallback(() => createTabs(tabs), [tabs]);

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
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tab}
          options={{
            headerShown: false,
          }}
        />
        {stack.map((page) => (
          <Stack.Screen name={page.name} component={page.component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
