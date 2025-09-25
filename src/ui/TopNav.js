"use client";

import Button from "./Button";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import favicon from "../app/favicon.ico";
import Image from "next/image";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase logout error:", err?.message);
    }
    window.location.href = "/login";
  }, []);

  const isActive = (href) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href);

  const navLink =
    "relative px-3 py-1.5 rounded-md text-sm transition-colors";
  const navInactive = "text-text-secondary hover:text-text-primary hover:bg-surface-hover";
  const navActive =
    "text-text-on-primary bg-primary";

  return (
    <header
      className={[
        "sticky top-0 z-30 border-b border-border-light",
        "bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60",
        elevated ? "shadow-[0_6px_16px_rgba(16,24,40,.08)]" : "shadow-none",
      ].join(" ")}
    >
      <div className="max-w-5xl mx-auto px-5">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full">
                <Image
                  src={favicon}
                  alt="favicon"
                  className="w-10 h-10"
                  width={40}
                  height={40}
                />
              </span>
              <span className="text-lg font-semibold text-text-primary hover:opacity-90">
                Shiftlytics
              </span>
            </a>

         
          </div>

          {/* Right: Actions (desktop) */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => (window.location.href = "/profile")}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
              aria-label="Profile"
              title="Profile"
            >
              <UserCircleIcon className="size-7" />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
              aria-label="Logout"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="size-5" />
              Logout
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-surface-hover"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <XMarkIcon className="size-6" /> : <Bars3Icon className="size-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            id="mobile-menu"
            className="md:hidden pb-3 border-t border-border-light animate-in fade-in slide-in-from-top-1"
          >
            <nav className="flex flex-col gap-1 pt-3">
              {/* Match desktop: Profile icon and Logout only */}
              <div className="flex gap-2 px-2 pt-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    window.location.href = "/profile";
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
                  aria-label="Profile"
                  title="Profile"
                >
                  <UserCircleIcon className="size-7" />
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
                  aria-label="Logout"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="size-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
