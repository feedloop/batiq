import { AppProvider, Navigation } from "@batiq/expo-runtime";
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
const importMaps = {
  "/page-1": Pages_Page_1,
  "/page-2": Pages_Page_2,
};
const App = (props) => {
  return (
    <AppProvider schema={schema}>
      <Navigation importMaps={importMaps} />
    </AppProvider>
  );
};
export default App;
