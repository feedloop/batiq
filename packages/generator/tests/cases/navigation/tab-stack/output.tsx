import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Page_1Page from "./pages/Page_1";
import Page_2Page from "./pages/Page_2";
import Page_3Page from "./pages/Page_3";
import Page_4Page from "./pages/Page_4";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const Tabs = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Home"
      options={{
        headerShown: false,
      }}
    >
      {() => (
        <HomeStack.Navigator>
          <HomeStack.Screen
            name="page 1"
            component={Page_1Page}
          ></HomeStack.Screen>
          <HomeStack.Screen
            name="page 4"
            component={Page_4Page}
          ></HomeStack.Screen>
        </HomeStack.Navigator>
      )}
    </Tab.Screen>
    <Tab.Screen name="About" component={Page_3Page}></Tab.Screen>
  </Tab.Navigator>
);
const App = () => (
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
      ></Stack.Screen>
      <Stack.Screen name="page 2" component={Page_2Page}></Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);
export default App;
