import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="top-0 z-10 overflow-hidden lg:sticky">
      <nav className="bg-white-1200 dark:bg-blackA-300 h-[60px] border-b border-slate-300 backdrop-blur backdrop-filter dark:border-slate-800">
        <div className="mx-auto flex h-full max-w-full items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="order-2 md:w-full lg:order-1 lg:w-96"
            >
              <div className=" bg-slateA-200 hover:bg-slateA-300 group flex h-[32px] w-full items-center justify-between rounded border border-slate-300 pl-1.5 pr-1.5 transition hover:border-slate-400 dark:border-slate-600 md:pl-3">
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sbui-icon text-slate-1100"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p className="text-slate-1100 group-hover:text-slate-1200 hidden text-sm transition md:flex">
                    Search docs...
                  </p>
                </div>
                <div className="hidden items-center space-x-1 md:flex">
                  <div className="text-slate-1200 h-5 w-10 items-center justify-center gap-1 rounded border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800 md:flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="sbui-icon "
                    >
                      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                    </svg>
                    <span className="text-[12px]">K</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
          <div className="hidden grow items-center justify-end gap-3 lg:flex">
            <div className="flex items-center">
              <Link
                href="/playground"
                className="btn btn-sm btn-outline btn-primary"
              >
                Playground
              </Link>
            </div>
            <div className="flex items-center">
              <a
                href="https://github.com/feedloop/batiq"
                target="_blank"
                rel="noreferrer noopener"
                className="font-regular text-slate-1200 relative inline-flex cursor-pointer items-center space-x-2 rounded px-2.5 py-1 text-center text-xs shadow-none outline-none outline-0   transition duration-200 ease-out hover:bg-slate-100 focus-visible:outline-4  focus-visible:outline-offset-1 focus-visible:outline-slate-700 dark:hover:bg-slate-800"
              >
                <span className="truncate">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </span>
              </a>
            </div>
            <ul className="flex items-center">
              <li className="rounded-sm px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <div
                  className="h-full w-full"
                  role="button"
                  onClick={() => {
                    const curr = document.documentElement.getAttribute("data-theme");

                    if (curr === "dark") {
                      document.documentElement.setAttribute("data-theme", "light");
                    } else {
                      document.documentElement.setAttribute("data-theme", "dark");
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-1100 hover:text-slate-1200 transition"
                  >
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
