import { AppProvider } from "@batiq/data";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Pages_Page_1 from "./pages/Page_1";
import Pages_Page_2 from "./pages/Page_2";
import Pages_Page_3 from "./pages/Page_3";
import Pages_Page_4 from "./pages/Page_4";
const schema = {
  batiq: "1",
  info: {
    name: "app",
  },
  platform: "web",
  config: {},
  prefixes: ["http://localhost:3000/", "app://"],
  pages: [
    {
      name: "page 1",
      navigation: {
        path: "/page-1",
        tab: {
          label: "Home",
          icon: "home",
        },
      },
      children: [],
    },
    {
      name: "page 2",
      navigation: {
        path: "/page-2",
      },
      children: [],
    },
    {
      name: "page 3",
      navigation: {
        path: "/page-3",
        tab: {
          label: "About",
          icon: "about",
        },
      },
      children: [],
    },
    {
      name: "page 4",
      navigation: {
        path: "/page-4",
        tab: {
          label: "Home",
          icon: "home",
        },
      },
      children: [],
    },
  ],
};
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const Tabs = (props) => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        options={{
          headerShown: false,
        }}
      >
        {() => (
          <HomeStack.Navigator>
            <HomeStack.Screen name="page 1" component={Pages_Page_1} />
            <HomeStack.Screen name="page 4" component={Pages_Page_4} />
          </HomeStack.Navigator>
        )}
      </Tab.Screen>
      <Tab.Screen name="About" component={Pages_Page_3} />
    </Tab.Navigator>
  );
};
const App = (props) => {
  return (
    <AppProvider schema={schema}>
      <NavigationContainer
        linking={{
          prefixes: process.env.LINK_PREFIXES ?? [],
          config: {
            screens: {
              Tabs: {
                screens: {
                  Home: {
                    screens: {
                      "page 1": "/page-1",
                      "page 4": "/page-4",
                    },
                  },
                  About: "/page-3",
                },
              },
              "page 2": "/page-2",
            },
          },
        }}
      >
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            component={Tabs}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="page 2" component={Pages_Page_2} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};
export default App;
