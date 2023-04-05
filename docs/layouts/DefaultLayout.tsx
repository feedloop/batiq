import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Logo from "@/components/Logo";

const DefaultLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <main className="bg-white text-slate-600 antialiased dark:bg-slate-900 dark:text-slate-400">
      <div className="flex h-screen flex-row">
        <aside className="!lg:left-0 absolute -left-[280px] top-0 ml-0 flex h-screen w-0 flex-col transition-all lg:relative lg:left-0 lg:w-[420px]">
          <div className="bg-white-1200 dark:bg-blackA-300 relative top-0 flex h-screen w-auto flex-col overflow-auto border-r border-slate-300 backdrop-blur backdrop-filter dark:border-slate-800">
            <div className="sticky top-0 z-10">
              <div className="h-24 w-full bg-slate-50 p-6 dark:bg-slate-900 text-5xl">
                <Logo />
              </div>
              <div className="h-4 w-full bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900"></div>
            </div>
            <div className="absolute left-0 right-0 top-[0px] h-screen px-5 py-16 pl-5 transition-all duration-200 ease-out lg:visible lg:relative lg:top-0 lg:left-0 lg:flex lg:px-10 lg:pb-10 lg:pt-0 lg:opacity-100">
              <Sidebar />
            </div>
          </div>
        </aside>
        <div className="absolute h-screen w-full overflow-auto transition-all ease-out lg:relative lg:ml-0">
          <Header />
          <div className="prose dark:prose-invert prose-headings:font-semibold mx-auto max-w-7xl grow px-5 py-16">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DefaultLayout;
