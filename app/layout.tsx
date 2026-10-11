import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Caveat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400", "600"],
  display: "swap",
  fallback: ["cursive"],
});

export const metadata: Metadata = {
  title: "Brand Name | Handmade Accessories",
  description: "Personalised fabric accessories crafted with care.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${caveat.variable}`}
    >
      <body className="bg-bg text-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
