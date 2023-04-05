import Link from "next/link";
import React from "react";

const navItems = [
  {
    title: "Overview",
    href: "/",
    items: [
      {
        title: "Getting Started",
        href: "#",
        items: [
          {
            title: "Installation",
            href: "/installation",
            items: [],
          },
          {
            title: "Quick Start",
            href: "/quick-start",
            items: [],
          },
        ],
      },
    ],
  },
  {
    title: "Core",
    href: null,
    items: [
      {
        title: "Schema",
        href: "/core/schema",
        items: [
          { title: "App Schema", href: "/core/schema/app-schema" },
          { title: "Component", href: "/core/schema/component" },
          { title: "Action", href: "/core/schema/action" },
          { title: "Breakpoint", href: "/core/schema/breakpoint" },
        ],
      },
      {
        title: "Generator",
        href: "/core/generator",
        items: [
          { title: "Expo", href: "/core/generator/expo" },
          { title: "Web React", href: "/core/generator/web-react" },
        ],
      },
      {
        title: "CLI",
        href: "/core/cli",
        items: [
          { title: "create", href: "/core/cli/create" },
          { title: "generate", href: "/core/cli/generate" },
        ],
      },
      {
        title: "Middleware",
        href: "/core/middleware",
        items: [
          { title: "History", href: "/core/middleware/history" },
          { title: "Multiplayer", href: "/core/middleware/multiplayer" },
        ],
      },
    ],
  },
  {
    title: "Library",
    href: null,
    items: [
      {
        title: "Components",
        href: "/library/components",
        items: [
          { title: "Text", href: "/library/components/text" },
          { title: "Box", href: "/library/components/box" },
        ],
      },
      {
        title: "Actions",
        href: "/library/actions",
        items: [
          { title: "Navigate", href: "/library/actions/navigate" },
          { title: "HTTP Request", href: "/library/actions/http-request" },
        ],
      },
    ],
  },
  {
    title: "Extensions",
    href: null,
    items: [
      {
        title: "DevTools",
        href: "",
        items: [
          { title: "Preview", href: "/tools/preview", items: [] },
          { title: "Inspector", href: "/tools/inspector", items: [] },
          { title: "Snapshot", href: "/tools/snapshot", items: [] },
        ],
      },
    ],
  },
];

const Sidebar = () => {
  return (
    <ul className="flex w-full flex-col gap-10 text-sm text-slate-600 dark:text-slate-400">
      {navItems.map((item, idx) => (
        <li key={item.title} className="flex flex-col">
          {idx !== 0 && (
            <div className="mb-4 h-[1px] w-full bg-gradient-to-r from-green-400  to-blue-500" />
          )}
          <Link
            href={item.href ?? "#"}
            className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-50"
          >
            {item.title}
          </Link>
          <div className="flex flex-col gap-6">
            {item.items.map((subItem) => (
              <ul key={subItem.title} className="flex flex-col gap-1">
                <li className="font-mono text-lg text-slate-900 dark:text-slate-50">
                  <Link href={subItem.href}>{subItem.title}</Link>
                </li>
                {subItem.items.map((subSubItem) => (
                  <li key={subSubItem.title} className="pl-2">
                    <Link
                      className="text-slate-900 dark:text-slate-400"
                      href={subSubItem.href}
                    >
                      {subSubItem.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;
