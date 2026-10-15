import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { CartDrawer } from "@/components/cart";
import { SITE_CONFIG } from "@/lib/config/site";
import { PreferencesProvider } from "@/lib/hooks/usePreferences";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { CartProvider } from "@/lib/hooks/useCart";

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
  title: {
    default: `${SITE_CONFIG.brandName} | ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.brandName}`,
  },
  description: SITE_CONFIG.metadata.description,
  icons: {
    icon: SITE_CONFIG.metadata.icons.icon,
    apple: SITE_CONFIG.metadata.icons.apple,
  },
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
      suppressHydrationWarning
    >
      <body
        className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased min-h-screen flex flex-col selection:bg-[var(--color-blush)] selection:text-[var(--color-text)]"
        suppressHydrationWarning
      >
        <PreferencesProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main id="main-content" tabIndex={-1} className="flex-1 w-full focus:outline-none">
                {children}
              </main>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
