import React from "react";
import type { NextPageWithLayout } from "./_app";
import FullWidthLayout from "@/layouts/FullWidthLayout";

const PlaygroundPage: NextPageWithLayout = () => {
  return <div>PlaygroundPage</div>;
};

PlaygroundPage.getLayout = function getLayout(page: React.ReactElement) {
  return <FullWidthLayout>{page}</FullWidthLayout>;
};

export default PlaygroundPage;
