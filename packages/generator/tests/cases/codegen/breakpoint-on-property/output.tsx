import { Paragraph, breakpoint, navigate } from "./test";
const Page = (props) => {
  return (
    <Paragraph
      color="red"
      onPress={breakpoint({
        sm: navigate("/page-1"),
        md: navigate("/page-2"),
      })}
    />
  );
};
export default Page;
