import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/stack";
import Page_1Page from "./pages/Page_1";
import Page_2Page from "./pages/Page_2";
import Page_3Page from "./pages/Page_3";
import Page_4Page from "./pages/Page_4";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Tabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={Page_1Page}></Tab.Screen>
    <Tab.Screen name="About" component={Page_3Page}></Tab.Screen>
    <Tab.Screen name="Settings" component={Page_4Page}></Tab.Screen>
  </Tab.Navigator>
);
const App = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs}></Stack.Screen>
      <Stack.Screen name="/page-2" component={Page_2Page}></Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);
export default App;
