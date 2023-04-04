import { Paragraph } from "@batiq/components";
import { breakpoint, navigate } from "@batiq/actions";
const Page = (props) => {
  const breakpoint_ = breakpoint();
  const navigate_ = navigate();
  const navigate_1 = navigate();
  return (
    <Paragraph
      color="red"
      onPress={breakpoint_({
        sm: navigate_("/page-1"),
        md: navigate_1("/page-2"),
      })}
    />
  );
};
export default Page;
