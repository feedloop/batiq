import { Paragraph } from "./test/paragraph";
import { navigate } from "./test/navigate";
const Page = (props) => {
  const navigate_ = navigate();
  return <Paragraph color={"red"} onPress={navigate_("/page-2")} />;
};
export default Page;
