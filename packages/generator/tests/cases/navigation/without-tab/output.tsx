import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/stack";
import Page_1Page from "./pages/Page_1";
import Page_2Page from "./pages/Page_2";
const Stack = createNativeStackNavigator();
const App = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="/page-1" component={Page_1Page}></Stack.Screen>
      <Stack.Screen name="/page-2" component={Page_2Page}></Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);
export default App;