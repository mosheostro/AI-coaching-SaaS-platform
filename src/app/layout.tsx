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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Coach Online — Personal transformation platform",
    template: "%s · Coach Online",
  },
  description:
    "Sessions, growth tasks, messaging and progress — one premium space for coaches and clients.",
  openGraph: {
    title: "Coach Online — Personal transformation platform",
    description:
      "A premium space where coaches and clients grow together — sessions, practice, dialogue and visible progress.",
    type: "website",
    siteName: "Coach Online",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coach Online",
    description: "Personal transformation platform for coaches and clients.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D12" },
  ],
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||t==='cosmic'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var c=document.documentElement.classList;if(d)c.add('dark');if(t==='cosmic')c.add('cosmic');if(t==='minimal')c.add('minimal');}catch(e){}})()`;

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
