import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Pages_Page_1 from "./pages/Page_1";
import Pages_Page_2 from "./pages/Page_2";
import Pages_Page_3 from "./pages/Page_3";
import Pages_Page_4 from "./pages/Page_4";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Tabs = (props) => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Pages_Page_1} />
      <Tab.Screen name="About" component={Pages_Page_3} />
      <Tab.Screen name="Settings" component={Pages_Page_4} />
    </Tab.Navigator>
  );
};
const App = (props) => {
  return (
    <NavigationContainer
      linking={{
        prefixes: process.env.LINK_PREFIXES ?? [],
        config: {
          screens: {
            Tabs: {
              screens: {
                Home: "/page-1",
                About: "/page-3",
                Settings: "/page-4",
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
  );
};
export default App;
