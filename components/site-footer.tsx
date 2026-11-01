"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Sparkles } from "lucide-react";

export function SiteFooter() {
  const pathname = usePathname();

  // Hide public footer on admin console routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const regions = [
    { name: "Europe", query: "Europe" },
    { name: "Asia", query: "Asia" },
    { name: "North America", query: "North America" },
    { name: "LATAM", query: "LATAM" },
    { name: "Africa", query: "Africa" },
    { name: "Oceania", query: "Oceania" },
    { name: "Middle East", query: "Middle East" },
  ];

  const popularCountries = [
    { name: "Japan", code: "JP" },
    { name: "Germany", code: "DE" },
    { name: "Ukraine", code: "UA" },
    { name: "France", code: "FR" },
    { name: "Brazil", code: "BR" },
    { name: "India", code: "IN" },
    { name: "Czech Republic", code: "CZ" },
    { name: "Sweden", code: "SE" },
  ];

  return (
    <footer className="border-t border-border/60 bg-muted/20 mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">DevAtlas</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              DevAtlas is an open global discovery directory of IT industry tools from around the world. We specialize in highlighting under-the-radar hidden gems alongside household names.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                <Sparkles className="h-3 w-3" />
                <span>65+ Curated Hidden Gems</span>
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Discovery Engine
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/atlas" className="hover:text-foreground transition-colors font-medium text-foreground">
                  🗺️ World Tech Atlas
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors">
                  ⚖️ Tool Versus Compare
                </Link>
              </li>
              <li>
                <Link href="/alternatives" className="hover:text-foreground transition-colors">
                  🔄 Software Swaps
                </Link>
              </li>
              <li>
                <Link href="/stacks" className="hover:text-foreground transition-colors">
                  🧰 Stack Builder & Saved
                </Link>
              </li>
              <li>
                <Link href="/hidden-gems" className="hover:text-violet-500 font-medium transition-colors">
                  💎 Hidden Gems Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              By World Region
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((reg) => (
                <Link
                  key={reg.name}
                  href={`/tools?region=${encodeURIComponent(reg.query)}`}
                  className="text-xs px-2 py-1 rounded-md bg-background border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {reg.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Top Country Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Country Hubs
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {popularCountries.map((c) => (
                <Link
                  key={c.code}
                  href={`/countries/${c.code.toLowerCase()}`}
                  className="text-xs px-2 py-1 rounded-md bg-background border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} DevAtlas. Information and discovery layer for software engineers.</p>
          <div className="flex items-center gap-1">
            <span>Built with Next.js, Tailwind CSS, Bun & Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
