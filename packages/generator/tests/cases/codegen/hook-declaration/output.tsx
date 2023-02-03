import { Paragraph } from "./test/paragraph";
import { useLinkTo } from "@react-navigation/native";
const Page = (props) => {
  const linkTo = useLinkTo();
  return <Paragraph color={"red"} onPress={linkTo("/page-2")} />;
};
export default Page;
