import remarkGfm from "remark-gfm";
import nextMdx from "@next/mdx";
import mdxPrism from "mdx-prism";

const withMDX = nextMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [mdxPrism],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
};


export default withMDX(nextConfig);
