import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Pages_Page_1 from "./pages/Page_1";
import Pages_Page_2 from "./pages/Page_2";
const Stack = createNativeStackNavigator();
const App = (props) => {
  return (
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
        <Stack.Screen name="page 1" component={Page_1Page} />
        <Stack.Screen name="page 2" component={Page_2Page} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;
