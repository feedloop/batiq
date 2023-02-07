import { Paragraph } from "./test";
import { navigate } from "./test";
const Page = (props) => {
  const navigate_ = navigate();
  return <Paragraph color={"red"} onPress={navigate_("/page-2")} />;
};
export default Page;
