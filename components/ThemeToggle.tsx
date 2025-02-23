"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IoSunny, IoMoon, IoDesktop } from "react-icons/io5";

/**
 * Theme toggle component
 * Provides buttons to switch between light, dark, and system theme
 */

export function ThemeToggle() {
  // Handle hydration mismatch
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-1">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md ${
          theme === "light"
            ? "bg-blue-100 text-blue-800"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title="Light Mode"
      >
        <IoSunny className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md ${
          theme === "system"
            ? "bg-blue-100 text-blue-800"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title="System Theme"
      >
        <IoDesktop className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md ${
          theme === "dark"
            ? "bg-blue-100 text-blue-800"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title="Dark Mode"
      >
        <IoMoon className="w-5 h-5" />
      </button>
    </div>
  );
}
