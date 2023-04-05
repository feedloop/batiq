import Header from "@/components/Header";
import Logo from "@/components/Logo";
import Sidebar from "@/components/Sidebar";
import React from "react";

const FullWidthLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <main className="bg-white text-slate-500 antialiased dark:bg-slate-900 dark:text-slate-400">
      <div className="flex h-screen flex-row">
        <div className="absolute h-screen w-full overflow-auto transition-all ease-out lg:relative lg:ml-0">
          <div className="flex">
            <div className="top-0 z-10 overflow-hidden lg:sticky">
              <nav className="bg-white-1200 dark:bg-blackA-300 h-[60px] border-b border-slate-300 backdrop-blur backdrop-filter dark:border-slate-800 py-2 px-4 text-4xl">
                <Logo />
              </nav>
            </div>
            <div className="flex-1">
              <Header />
            </div>
          </div>
          <div className="mx-auto max-w-full grow px-5 py-16">{children}</div>
        </div>
      </div>
    </main>
  );
};

export default FullWidthLayout;
