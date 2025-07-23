import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/app/context/AuthContext";
import  NavbarDemo  from "@/app/components/Navbar";
import Footer from "@/app/components/home/Footer";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // choose the weights you use
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "Pokédex App",
  description: "A modern Pokédex built with Next.js, Express, and MongoDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.className} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavbarDemo />
          <AuthProvider>
            <main className="min-h-screen pt-4">
              {children}
            </main>
          </AuthProvider>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
