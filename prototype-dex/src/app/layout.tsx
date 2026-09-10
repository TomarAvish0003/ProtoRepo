import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/app/context/AuthContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/home/Footer";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://proto-repo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ProtoDex // Competitive Pokédex & Team Builder",
    template: "%s // ProtoDex",
  },
  description:
    "Engineering-grade competitive Pokémon Pokédex, tournament team builder, 18x6 dense defense matrix, and 16-roll discrete damage calculator.",
  keywords: [
    "Pokemon",
    "Pokedex",
    "Team Builder",
    "Damage Calculator",
    "Competitive Pokemon",
    "VGC",
    "Smogon",
    "Gen 9",
  ],
  authors: [{ name: "ProtoDex Team" }],
  creator: "ProtoDex",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "ProtoDex // Competitive Pokédex & Team Builder",
    description:
      "Engineering-grade competitive Pokémon Pokédex, tournament team builder, and damage calculator.",
    siteName: "ProtoDex",
    images: [
      {
        url: "/detective-pikachu.jpg",
        width: 1200,
        height: 630,
        alt: "ProtoDex - Competitive Pokédex & Tournament Team Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProtoDex // Competitive Pokédex & Team Builder",
    description:
      "Engineering-grade competitive Pokémon Pokédex, tournament team builder, and damage calculator.",
    images: ["/detective-pikachu.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background font-body-md text-on-surface anime-grid-bg min-h-screen antialiased selection:bg-primary selection:text-white transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <div className="flex flex-col min-h-screen">
              <div className="flex-1 w-full">
                {children}
              </div>
              <Footer />
            </div>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
