import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { brand } from "@/config/brand";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/layout/AppProviders";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://blazeandbun.pk",
  ),
  title: {
    default: `${brand.name} — ${brand.tagline} | Order Online in Pakistan`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Flame-seared gourmet burgers, 24-hour marinated peri peri chicken and wings tossed to order. Order delivery, pick-up or catering across Karachi, Lahore, Islamabad and beyond.",
  keywords: [
    "gourmet burgers Pakistan",
    "burger delivery Karachi",
    "peri peri chicken Lahore",
    "wings Islamabad",
    "online food order Pakistan",
    "halal burgers",
  ],
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.voice,
    type: "website",
    locale: "en_PK",
  },
};

export const viewport: Viewport = {
  themeColor: "#100E0C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${bebas.variable} ${jakarta.variable}`}
    >
      {/*
        suppressHydrationWarning: browser extensions (Grammarly, shopping
        assistants, etc.) inject attributes into <body> before React hydrates.
        This scopes the warning suppression to this element only — nested
        hydration errors still surface normally.
      */}
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-cream font-sans antialiased"
      >
        {/* Strip bis_skin_checked attrs injected by browser extensions
            (Urban VPN / Bitdefender) before React hydrates. */}
        <Script
          src="/fix-extension-attrs.js"
          strategy="beforeInteractive"
        />
        <AppProviders>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
