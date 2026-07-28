import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const heading = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-heading", weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Whole Body Foundation — Mojave Fieldwork",
  description: "Community field science for ecological resilience in the Mojave Desert.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${body.variable} ${heading.variable} ${mono.variable}`}>{children}</body></html>;
}
