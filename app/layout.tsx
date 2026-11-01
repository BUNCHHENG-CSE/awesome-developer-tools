import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProvider } from "@/components/auth-provider";
import { AuthDialog } from "@/components/auth-dialog";
import { CompareProvider } from "@/lib/compare-context";
import { BookmarksProvider } from "@/lib/bookmarks-context";
import { CompareBar } from "@/components/compare/compare-bar";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevAtlas — Global Discovery Directory for IT Tools (Famous & Hidden Gems)",
  description:
    "Discover software tools, languages, frameworks, and devops utilities from around the world — especially the under-the-radar hidden gems 99% of developers haven't heard of.",
  keywords: [
    "IT tools",
    "developer tools",
    "open source",
    "hidden gems",
    "devops",
    "programming languages",
    "web frameworks",
    "software directory",
  ],
  authors: [{ name: "DevAtlas Community" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/20">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <BookmarksProvider>
              <CompareProvider>
                <TooltipProvider delay={150}>
                  <div className="flex min-h-screen flex-col">
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                    <SiteFooter />
                  </div>
                  <CompareBar />
                  <AuthDialog />
                  <Toaster position="bottom-right" richColors />
                </TooltipProvider>
              </CompareProvider>
            </BookmarksProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
