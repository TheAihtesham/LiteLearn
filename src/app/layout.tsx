import type { Metadata } from "next";

import Header from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiteLearn",
  description: "Video lessons that work on slow internet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-[#10201c]"
        >
          Skip to content
        </a>

        <Header />

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>

       
      </body>
    </html>
  );
}