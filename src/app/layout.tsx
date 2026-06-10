import type { Metadata } from "next";
import { Inter, Inter_Tight, Noto_Sans_Hebrew } from "next/font/google";
import { getLocale } from "@/i18n";
import { dirFor } from "@/i18n/config";
import "./globals.css";

const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

const heading = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  display: "swap",
});

const hebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coach Online — Personal transformation platform",
  description: "Sessions, growth tasks, messaging and progress — one premium space for coaches and clients.",
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      suppressHydrationWarning
      className={`${body.variable} ${heading.variable} ${hebrew.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
