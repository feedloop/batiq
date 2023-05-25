import { PageWrapper } from "@batiq/expo-runtime";
import { Text } from "@batiq/components/elements";
import { useLazyExpression } from "@batiq/expression";
const Page = (props) => {
  const evaluate = useLazyExpression();
  return (
    <PageWrapper>
      <Text color="blue">
        Hello{false}
        {123}
        {evaluate("1 + 1")}
      </Text>
    </PageWrapper>
  );
};
export default Page;
