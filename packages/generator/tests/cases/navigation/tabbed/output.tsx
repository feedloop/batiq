import { AppProvider, Navigation } from "@batiq/expo-runtime";
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
  prefixes: ["http://localhost"],
  config: {},
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
          label: "Settings",
          icon: "Settings",
        },
      },
      children: [],
    },
  ],
};
const importMaps = {
  "/page-1": Pages_Page_1,
  "/page-2": Pages_Page_2,
  "/page-3": Pages_Page_3,
  "/page-4": Pages_Page_4,
};
const App = (props) => {
  return (
    <AppProvider schema={schema}>
      <Navigation importMaps={importMaps} />
    </AppProvider>
  );
};
export default App;
