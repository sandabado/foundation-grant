import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const heading = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-heading", weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://wholebody.foundation"),
  title: "Whole Body Foundation — Old Glory Peak Field Station",
  description: "Public-interest fieldwork connecting environmental observation, land stewardship, and community learning in the eastern Mojave.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Fieldwork for a Living Planet",
    description: "Observe the land. Test what works. Share what holds.",
    url: "https://wholebody.foundation",
    siteName: "Whole Body Foundation",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1672,
        height: 941,
        alt: "Whole Body Foundation — Fieldwork for a Living Planet over abstract desert terrain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fieldwork for a Living Planet",
    description: "Observe the land. Test what works. Share what holds.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${body.variable} ${heading.variable} ${mono.variable}`}>{children}</body></html>;
}
