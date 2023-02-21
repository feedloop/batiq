import { AppSchema, PageSchema } from "@batiq/core";
import { toVariableName } from "./utils/naming";
import { PageIR, ComponentImport, Value, Component, JSX } from "@batiq/ir";

type Tab = {
  tab: NonNullable<PageSchema["navigation"]["tab"]>;
  page: PageSchema | PageSchema[];
};

type Navigation = {
  tabs: Record<string, Tab>;
  stack: PageSchema[];
};

export const toNavigation = (pages: PageSchema[]): Navigation =>
  pages.reduce(
    (navigation: Navigation, page: PageSchema): Navigation => {
      if (!page.navigation.tab) {
        return {
          ...navigation,
          stack: [...navigation.stack, page],
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
                  page,
                ],
              }
            : { tab: page.navigation.tab, page },
        },
      };
    },
    { tabs: {}, stack: [] }
  );

export const generateNavigationPageIR = (schema: AppSchema): PageIR => {
  const navigation = toNavigation(schema.pages);

  const imports: ComponentImport[] = [
    {
      source: "@react-navigation/native",
      names: ["NavigationContainer"],
      default: false,
    },
    {
      source: "@react-navigation/bottom-tabs",
      names: ["createBottomTabNavigator"],
      default: false,
    },
    {
      source: "@react-navigation/native-stack",
      names: ["createNativeStackNavigator"],
      default: false,
    },
    ...schema.pages.map((page) => ({
      source: `./pages/${toVariableName(page.name)}`,
      names: [],
      default: true,
    })),
  ];

  const tabStacks = Object.entries(navigation.tabs).filter(
    (tab): tab is [string, Tab & { page: PageSchema[] }] =>
      Array.isArray(tab[1].page)
  );

  const variableDeclarations: [string, Value][] = [
    [
      "Stack",
      {
        type: "function_call",
        name: "createNativeStackNavigator",
        arguments: [],
      },
    ],
    ...(Object.keys(navigation.tabs).length > 0
      ? [
          [
            "Tab",
            {
              type: "function_call",
              name: "createBottomTabNavigator",
              arguments: [],
            },
          ] as [string, Value],
        ]
      : []),
    ...tabStacks.map(([tab]): [string, Value] => [
      `${tab}Stack`,
      {
        type: "function_call",
        name: "createNativeStackNavigator",
        arguments: [],
      },
    ]),
  ];

  const tabScreens: JSX[] = Object.entries(navigation.tabs).map(
    ([tab, pages]): JSX =>
      Array.isArray(pages.page)
        ? ({
            type: "element",
            name: ["Tab", "Screen"],
            props: [
              {
                name: "name",
                value: tab,
              },
              {
                name: "options",
                value: { headerShown: false },
              },
            ],
            children: [
              {
                type: "render_prop",
                parameters: [],
                JSX: {
                  type: "element",
                  name: [`${tab}Stack`, "Navigator"],
                  props: [],
                  children: pages.page.map(
                    (page): JSX => ({
                      type: "element",
                      name: [`${tab}Stack`, "Screen"],
                      props: [
                        {
                          name: "name",
                          value: page.name,
                        },
                        {
                          name: "component",
                          value: {
                            type: "variable",
                            name: toVariableName(
                              `./pages/${toVariableName(page.name)}`
                            ),
                          },
                        },
                      ],
                      children: [],
                    })
                  ),
                },
              },
            ],
          } as JSX)
        : ({
            type: "element",
            name: ["Tab", "Screen"],
            props: [
              {
                name: "name",
                value: tab,
              },
              {
                name: "component",
                value: {
                  type: "variable",
                  name: toVariableName(
                    `./pages/${toVariableName(pages.page.name)}`
                  ),
                },
              },
            ],
            children: [],
          } as JSX)
  );

  const tabComponent: Component | null =
    tabScreens.length > 0
      ? {
          name: "Tabs",
          variableDeclarations: {},
          root: false,
          JSX: [
            {
              type: "element",
              name: ["Tab", "Navigator"],
              props: [],
              children: tabScreens,
            },
          ],
        }
      : null;

  const appComponent: Component = {
    name: "App",
    variableDeclarations: {},
    root: true,
    JSX: [
      {
        type: "element",
        name: ["NavigationContainer"],
        props: [
          {
            name: "linking",
            value: {
              prefixes: {
                type: "binary_operator",
                operator: "??",
                left: {
                  type: "variable",
                  name: "process.env.LINK_PREFIXES",
                },
                right: [],
              },
              config: {
                screens: {
                  ...(Object.keys(navigation.tabs).length > 0
                    ? {
                        Tabs: {
                          screens: Object.fromEntries(
                            Object.values(navigation.tabs).map(
                              (tab): [string, any] =>
                                Array.isArray(tab.page)
                                  ? [
                                      tab.tab.label,
                                      {
                                        screens: Object.fromEntries(
                                          tab.page.map((page) => [
                                            page.name,
                                            page.navigation.path,
                                          ])
                                        ),
                                      },
                                    ]
                                  : [tab.tab.label, tab.page.navigation.path]
                            )
                          ),
                        },
                      }
                    : {}),
                  ...Object.fromEntries(
                    navigation.stack.map((page) => [
                      page.name,
                      page.navigation.path,
                    ])
                  ),
                },
              },
            },
          },
        ],
        children: [
          {
            type: "element",
            name: ["Stack", "Navigator"],
            props: [],
            children: [
              ...(Object.keys(navigation.tabs).length > 0
                ? [
                    {
                      type: "element",
                      name: ["Stack", "Screen"],
                      props: [
                        {
                          name: "name",
                          value: "Tabs",
                        },
                        {
                          name: "component",
                          value: {
                            type: "variable",
                            name: "Tabs",
                          },
                        },
                        {
                          name: "options",
                          value: {
                            headerShown: false,
                          },
                        },
                      ],
                      children: [],
                    } as JSX,
                  ]
                : []),
              ...navigation.stack.map(
                (page): JSX => ({
                  type: "element",
                  name: ["Stack", "Screen"],
                  props: [
                    {
                      name: "name",
                      value: page.name,
                    },
                    {
                      name: "component",
                      value: {
                        type: "variable",
                        name: toVariableName(
                          `./pages/${toVariableName(page.name)}`
                        ),
                      },
                    },
                  ],
                  children: [],
                })
              ),
            ],
          },
        ],
      },
    ],
  };

  return {
    imports,
    variableDeclarations: Object.fromEntries(variableDeclarations),
    components: [tabComponent, appComponent].filter((c): c is Component => !!c),
  };
};
