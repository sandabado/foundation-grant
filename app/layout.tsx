import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const heading = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-heading", weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://foundation-grant-j9uj.vercel.app"),
  title: "Whole Body Foundation — Old Glory Peak Field Station",
  description: "Public-interest field science mapping the Old Glory Peak transect corridor in Morongo Valley, California.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Fieldwork for a Living Planet",
    description: "Whole Body Foundation — public-interest field science at the Old Glory Peak transect corridor.",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1672,
        height: 941,
        alt: "Fieldwork for a Living Planet over Old Glory Peak terrain with green computational field lines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fieldwork for a Living Planet",
    description: "Whole Body Foundation — public-interest field science at the Old Glory Peak transect corridor.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${body.variable} ${heading.variable} ${mono.variable}`}>{children}</body></html>;
}
