import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { SITE_CONFIG } from "@/lib/config/site";

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
  title: `${SITE_CONFIG.brandName} | ${SITE_CONFIG.tagline}`,
  description: "Personalised fabric accessories crafted with care by hand.",
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
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased min-h-screen flex flex-col selection:bg-[var(--color-blush)] selection:text-[var(--color-text)]">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
