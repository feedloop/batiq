import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Pages_Page_1 from "./pages/Page_1";
import Pages_Page_2 from "./pages/Page_2";
const schema = {
  batiq: "1",
  info: {
    name: "app",
  },
  platform: "web",
  prefixes: ["http://localhost"],
  config: {},
  pages: [
    {
      name: "page 1",
      navigation: {
        path: "/page-1",
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
  ],
};
const Stack = createNativeStackNavigator();
const App = (props) => {
  return (
    <AppProvider app={schema}>
      <NavigationContainer
        linking={{
          prefixes: process.env.LINK_PREFIXES ?? [],
          config: {
            screens: {
              "page 1": "/page-1",
              "page 2": "/page-2",
            },
          },
        }}
      >
        <Stack.Navigator>
          <Stack.Screen name="page 1" component={Pages_Page_1} />
          <Stack.Screen name="page 2" component={Pages_Page_2} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};
export default App;
