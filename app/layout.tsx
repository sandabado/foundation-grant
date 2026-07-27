import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Whole Body Foundation — Mojave Fieldwork",
  description: "Community field science for ecological resilience in the Mojave Desert.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${mono.variable}`}>{children}</body></html>;
}
