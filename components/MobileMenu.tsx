"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./LogoMark";

const navItems = [
  { href: "/", label: "みんなの作品" },
  { href: "/sheets", label: "なぞりシート" },
  { href: "/about", label: "3Dひろばとは" },
  { href: "/about#submit", label: "できた！をみせる" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const drawer = (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />
      <div className="absolute top-0 right-0 h-full w-72 max-w-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-bold tracking-wide">3Dひろば</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink"
            aria-label="メニューを閉じる"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="16" y2="16" />
              <line x1="16" y1="2" x2="2" y2="16" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-6 py-4 text-base font-medium text-ink hover:bg-gray-50 transition-colors border-b border-black/5 last:border-b-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 p-1"
        aria-label="メニューを開く"
      >
        <span className="block h-0.5 w-full bg-ink rounded" />
        <span className="block h-0.5 w-full bg-ink rounded" />
        <span className="block h-0.5 w-full bg-ink rounded" />
      </button>

      {/*
        Render the drawer via a portal to document.body so it escapes the
        site header's `backdrop-blur`. A backdrop-filter ancestor becomes the
        containing block for fixed-position children, which would otherwise
        clip the overlay/panel to the header's height.
      */}
      {open && mounted && createPortal(drawer, document.body)}
    </>
  );
}
