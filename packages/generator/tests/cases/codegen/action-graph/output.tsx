import { Paragraph, navigate } from "./test";
import { useActionGraph } from "@batiq/actions";
import { log } from "actions";
const Page = (props) => {
  const navigate_ = navigate();
  const actionGraph = useActionGraph({
    nodes: [
      async (evaluate) => navigate_("/page-2"),
      async (evaluate) => log("Hello World"),
    ],
    successEdges: [[0, 1]],
    errorEdges: [],
  });
  return <Paragraph color="red" onPress={actionGraph} />;
};
export default Page;
