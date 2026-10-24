"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/lessons", label: "Lessons", matches: ["/lessons", "/lesson"] },
  { href: "/dashboard", label: "Data saved", matches: ["/dashboard"] },
];

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

 
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (matches: string[]) =>
    matches.some((m) => pathname === m || pathname.startsWith(`${m}/`));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#17302b]/95 text-[#f4f6f2] backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} className={`flex items-center gap-2 ${focus}`}>
          <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
            <rect width="32" height="32" rx="8" fill="#e8b23a" />
            <path d="M12 9.5v13l11-6.5z" fill="#10201c" />
          </svg>
          <span className="display text-xl font-semibold">LiteLearn</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => {
            const active = isActive(l.matches);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 py-1 transition-colors ${focus} ${
                  active ? "border-[#e8b23a] text-white" : "border-transparent text-[#d5ddd8] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/teacher"
            className={`rounded bg-[#e8b23a] px-3 py-1.5 font-medium text-[#10201c] hover:bg-[#f0c05a] ${focus}`}
          >
            Upload a lesson
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className={`rounded p-2 md:hidden ${focus}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((l) => {
              const active = isActive(l.matches);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded px-3 py-3 text-base ${focus} ${
                    active ? "bg-white/10 font-medium text-white" : "text-[#d5ddd8] hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/teacher"
              onClick={() => setOpen(false)}
              className={`mt-2 rounded bg-[#e8b23a] px-4 py-3 text-center font-medium text-[#10201c] ${focus}`}
            >
              Upload a lesson
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}