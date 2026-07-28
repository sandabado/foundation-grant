import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const heading = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-heading", weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://foundation-grant-j9uj.vercel.app"),
  title: "Whole Body Foundation — Mojave Field Research",
  description: "A community research station mapping the unseen forces that shape desert ecology and testing practical systems for life in a hotter, drier world.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Fieldwork for a Living Planet",
    description: "Whole Body Foundation — public-interest field research in the eastern Mojave.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1733,
        height: 907,
        alt: "Fieldwork for a Living Planet over the Sawtooth Mountains terrain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fieldwork for a Living Planet",
    description: "Whole Body Foundation — public-interest field research in the eastern Mojave.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${body.variable} ${heading.variable} ${mono.variable}`}>{children}</body></html>;
}
