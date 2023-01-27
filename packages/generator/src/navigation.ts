import { AppSchema, PageSchema } from "@batiq/core";
import * as t from "@babel/types";
import { toVariableName } from "./transformIR";
import * as prettier from "prettier";
import { createRequire } from "module";
import { valueToAST } from "./utils/valueToAST";
const require = createRequire(import.meta.url);
const { default: generate } = require("@babel/generator");

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

const generateNavigationProgram = (schema: AppSchema): t.Program => {
  const navigation = toNavigation(schema.pages);

  const tabStacks = Object.entries(navigation.tabs).filter(
    (tab): tab is [string, Tab & { page: PageSchema[] }] =>
      Array.isArray(tab[1].page)
  );
  const tabStackComponents = tabStacks.map(([tab]) =>
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(`${tab}Stack`),
        t.callExpression(t.identifier("createNativeStackNavigator"), [])
      ),
    ])
  );
  const tabScreens = Object.entries(navigation.tabs).map(([tab, pages], i) =>
    Array.isArray(pages.page)
      ? t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(`Tab.Screen`),
            [
              t.jsxAttribute(t.jsxIdentifier("name"), t.stringLiteral(tab)),
              t.jsxAttribute(
                t.jsxIdentifier("options"),
                t.jsxExpressionContainer(valueToAST({ headerShown: false }))
              ),
            ],
            false
          ),
          t.jsxClosingElement(t.jsxIdentifier(`Tab.Screen`)),
          [
            t.jsxExpressionContainer(
              t.arrowFunctionExpression(
                [],
                t.jsxElement(
                  t.jsxOpeningElement(
                    t.jsxIdentifier(`${tab}Stack.Navigator`),
                    [],
                    false
                  ),
                  t.jsxClosingElement(t.jsxIdentifier(`${tab}Stack.Navigator`)),
                  pages.page.map((page) =>
                    t.jsxElement(
                      t.jsxOpeningElement(
                        t.jsxIdentifier(`${tab}Stack.Screen`),
                        [
                          t.jsxAttribute(
                            t.jsxIdentifier("name"),
                            t.stringLiteral(page.name)
                          ),
                          t.jsxAttribute(
                            t.jsxIdentifier("component"),
                            t.jsxExpressionContainer(
                              t.identifier(`${toVariableName(page.name)}Page`)
                            )
                          ),
                        ],
                        false
                      ),
                      t.jsxClosingElement(
                        t.jsxIdentifier(`${tab}Stack.Screen`)
                      ),
                      []
                    )
                  )
                )
              )
            ),
          ]
        )
      : t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(`Tab.Screen`),
            [
              t.jsxAttribute(t.jsxIdentifier("name"), t.stringLiteral(tab)),
              t.jsxAttribute(
                t.jsxIdentifier("component"),
                t.jsxExpressionContainer(
                  t.identifier(`${toVariableName(pages.page.name)}Page`)
                )
              ),
            ],
            false
          ),
          t.jsxClosingElement(t.jsxIdentifier(`Tab.Screen`)),
          []
        )
  );

  return t.program([
    t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier("NavigationContainer"),
          t.identifier("NavigationContainer")
        ),
      ],
      t.stringLiteral("@react-navigation/native")
    ),
    t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier("createBottomTabNavigator"),
          t.identifier("createBottomTabNavigator")
        ),
      ],
      t.stringLiteral("@react-navigation/bottom-tabs")
    ),
    t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier("createNativeStackNavigator"),
          t.identifier("createNativeStackNavigator")
        ),
      ],
      t.stringLiteral("@react-navigation/native-stack")
    ),
    ...schema.pages.map((page) =>
      t.importDeclaration(
        [
          t.importDefaultSpecifier(
            t.identifier(`${toVariableName(page.name)}Page`)
          ),
        ],
        t.stringLiteral(`./pages/${toVariableName(page.name)}`)
      )
    ),

    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier("Stack"),
        t.callExpression(t.identifier("createNativeStackNavigator"), [])
      ),
    ]),
    ...(tabScreens.length > 0
      ? [
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("Tab"),
              t.callExpression(t.identifier("createBottomTabNavigator"), [])
            ),
          ]),
        ]
      : []),

    ...tabStackComponents,

    ...(tabScreens.length > 0
      ? [
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("Tabs"),
              t.arrowFunctionExpression(
                [],
                t.jsxElement(
                  t.jsxOpeningElement(
                    t.jsxIdentifier("Tab.Navigator"),
                    [],
                    false
                  ),
                  t.jsxClosingElement(t.jsxIdentifier("Tab.Navigator")),
                  tabScreens
                )
              )
            ),
          ]),
        ]
      : []),
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier("App"),
        t.arrowFunctionExpression(
          [],
          t.jsxElement(
            t.jsxOpeningElement(
              t.jsxIdentifier("NavigationContainer"),
              [
                t.jsxAttribute(
                  t.jsxIdentifier("linking"),
                  t.jsxExpressionContainer(
                    valueToAST({
                      prefixes: t.logicalExpression(
                        "??",
                        t.identifier("process.env.LINK_PREFIXES"),
                        t.arrayExpression([])
                      ),
                      config: {
                        screens: {
                          ...(tabScreens.length > 0
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
                                          : [
                                              tab.tab.label,
                                              tab.page.navigation.path,
                                            ]
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
                    })
                  )
                ),
              ],
              false
            ),
            t.jsxClosingElement(t.jsxIdentifier("NavigationContainer")),
            [
              t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier("Stack.Navigator"),
                  [],
                  false
                ),
                t.jsxClosingElement(t.jsxIdentifier("Stack.Navigator")),
                (tabScreens.length > 0
                  ? [
                      t.jsxElement(
                        t.jsxOpeningElement(
                          t.jsxIdentifier("Stack.Screen"),
                          [
                            t.jsxAttribute(
                              t.jsxIdentifier("name"),
                              t.stringLiteral("Tabs")
                            ),
                            t.jsxAttribute(
                              t.jsxIdentifier("component"),
                              t.jsxExpressionContainer(t.identifier("Tabs"))
                            ),
                            t.jsxAttribute(
                              t.jsxIdentifier("options"),
                              t.jsxExpressionContainer(
                                valueToAST({ headerShow: false })
                              )
                            ),
                          ],
                          false
                        ),
                        t.jsxClosingElement(t.jsxIdentifier("Stack.Screen")),
                        []
                      ),
                    ]
                  : []
                ).concat(
                  navigation.stack.map((page) =>
                    t.jsxElement(
                      t.jsxOpeningElement(
                        t.jsxIdentifier("Stack.Screen"),
                        [
                          t.jsxAttribute(
                            t.jsxIdentifier("name"),
                            t.stringLiteral(page.name)
                          ),
                          t.jsxAttribute(
                            t.jsxIdentifier("component"),
                            t.jsxExpressionContainer(
                              t.identifier(`${toVariableName(page.name)}Page`)
                            )
                          ),
                        ],
                        false
                      ),
                      t.jsxClosingElement(t.jsxIdentifier("Stack.Screen")),
                      []
                    )
                  )
                )
              ),
            ]
          )
        )
      ),
    ]),
    t.exportDefaultDeclaration(t.identifier("App")),
  ]);
};

export const generateNavigation = (
  schema: AppSchema,
  format?: boolean
): string => {
  const { code } = generate(generateNavigationProgram(schema));
  return format ? prettier.format(code, { parser: "babel" }) : code;
};
