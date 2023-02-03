import Test_Paragraph, { Paragraph } from "./test/paragraph";
const PageWithNestedComponent = (props) => {
  return (
    <>
      <Test_Paragraph color={"blue"}>
        <Paragraph color={"red"} />
      </Test_Paragraph>
      <Paragraph color={"blue"} />
    </>
  );
};
export default PageWithNestedComponent;
