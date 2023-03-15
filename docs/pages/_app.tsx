import DefaultLayout from "@/layouts/DefaultLayout";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { Inconsolata, Inter, Lora } from "next/font/google";
import type { ReactElement, ReactNode } from "react";

import "@/styles/global.css";
import "prism-themes/themes/prism-one-dark.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <main
      className={`${inter.variable} ${inconsolata.variable} ${lora.variable} font-sans`}
    >
      {getLayout(<Component {...pageProps} />)}
    </main>
  );
}
