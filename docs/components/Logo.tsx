import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <div
      className="font-bold tracking-tighter"
      style={{ fontFamily: "var(--font-lora)" }}
    >
      <Link href="/">
        <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          batiq
        </span>
      </Link>
    </div>
  );
};

export default Logo;
