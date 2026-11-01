"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe2,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Layers,
  Search,
  MapPin,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";

export interface AtlasCountry {
  id: string;
  code: string;
  name: string;
  region?: string | null;
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    tagline: string;
    websiteUrl: string;
    hiddenGem: boolean;
    hiddenGemReason?: string | null;
    category?: { name: string; slug: string } | null;
  }>;
}

interface WorldAtlasProps {
  countries: AtlasCountry[];
}

const REGIONS = [
  "All",
  "Europe",
  "Asia",
  "North America",
  "LATAM",
  "Africa",
  "Oceania",
  "Middle East",
] as const;

// Geographic coordinates approx for SVG pin rendering (relative 0-100% on projection)
const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  US: { x: 23, y: 35 },
  CA: { x: 25, y: 22 },
  BR: { x: 37, y: 68 },
  GB: { x: 48, y: 28 },
  FR: { x: 49, y: 33 },
  DE: { x: 52, y: 30 },
  NL: { x: 51, y: 29 },
  PL: { x: 54, y: 29 },
  UA: { x: 58, y: 31 },
  SE: { x: 53, y: 22 },
  NO: { x: 50, y: 22 },
  FI: { x: 56, y: 21 },
  ES: { x: 47, y: 38 },
  IT: { x: 52, y: 36 },
  CH: { x: 51, y: 34 },
  NG: { x: 50, y: 55 },
  IL: { x: 59, y: 42 },
  IN: { x: 70, y: 46 },
  SG: { x: 77, y: 57 },
  JP: { x: 86, y: 38 },
  AU: { x: 85, y: 76 },
  NZ: { x: 92, y: 84 },
  EE: { x: 56, y: 24 },
  IE: { x: 46, y: 28 },
  CZ: { x: 53, y: 31 },
  KR: { x: 83, y: 37 },
  CN: { x: 77, y: 39 },
  TW: { x: 82, y: 45 },
};

export function WorldAtlas({ countries }: WorldAtlasProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>(
    countries.length > 0 ? countries[0].code : "JP"
  );

  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      const matchRegion =
        selectedRegion === "All" ||
        (c.region && c.region.toLowerCase() === selectedRegion.toLowerCase());
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.tools.some((t) => t.name.toLowerCase().includes(search.toLowerCase()));
      return matchRegion && matchSearch;
    });
  }, [countries, selectedRegion, search]);

  const activeCountry = useMemo(() => {
    return (
      countries.find((c) => c.code.toUpperCase() === selectedCode.toUpperCase()) ||
      filteredCountries[0] ||
      countries[0]
    );
  }, [countries, selectedCode, filteredCountries]);

  return (
    <div className="space-y-8">
      {/* Search & Continent Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRegion === r
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or tool origin..."
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Map + Active Country Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Map Canvas & Country Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Vector Map Card */}
          <div className="relative p-6 rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-card/60 shadow-md overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-violet-500 animate-spin-slow" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Interactive Origin Pins
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Showing {filteredCountries.length} countries
              </span>
            </div>

            {/* SVG Visual World Projection Map */}
            <div className="relative w-full aspect-[16/9] mt-4 bg-muted/20 rounded-2xl border border-border/50 overflow-hidden flex items-center justify-center">
              {/* Background abstract continent shapes */}
              <svg
                viewBox="0 0 1000 500"
                className="w-full h-full opacity-20 dark:opacity-10 pointer-events-none fill-foreground"
              >
                {/* North America */}
                <path d="M120,80 Q250,50 300,120 Q280,220 200,240 Q150,180 120,80 Z" />
                {/* South America */}
                <path d="M280,260 Q380,270 360,420 Q310,470 270,360 Z" />
                {/* Europe */}
                <path d="M460,80 Q580,70 560,180 Q480,200 460,80 Z" />
                {/* Africa */}
                <path d="M460,210 Q580,200 560,370 Q480,390 460,210 Z" />
                {/* Asia */}
                <path d="M600,70 Q880,80 840,260 Q660,280 600,70 Z" />
                {/* Australia */}
                <path d="M780,320 Q880,330 870,420 Q770,410 780,320 Z" />
              </svg>

              {/* Geographic Pins */}
              {countries.map((country) => {
                const coord = COUNTRY_COORDS[country.code.toUpperCase()] || {
                  x: 50,
                  y: 50,
                };
                const isSelected = activeCountry?.code === country.code;
                const toolCount = country.tools.length;

                return (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCode(country.code)}
                    style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all z-20 focus:outline-none`}
                    title={`${country.name} (${toolCount} tools)`}
                  >
                    <span
                      className={`relative flex items-center justify-center rounded-full transition-transform ${
                        isSelected
                          ? "scale-125 ring-4 ring-primary/40 bg-primary text-primary-foreground h-7 w-7 shadow-lg"
                          : "hover:scale-110 bg-card border border-primary/50 text-foreground h-5 w-5 shadow-xs"
                      }`}
                    >
                      <span className="text-[10px] font-bold">{country.code}</span>
                      {isSelected && (
                        <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping pointer-events-none" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground text-center pt-3">
              Click any pin or country card to inspect regional software engineering gems.
            </p>
          </div>

          {/* Quick Country Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredCountries.map((c) => {
              const isSelected = activeCountry?.code === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCode(c.code)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 text-xs ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs font-semibold text-foreground"
                      : "border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <CountryFlag code={c.code} name={c.name} linkable={false} />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-bold shrink-0">
                    {c.tools.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Country Tool Inspector Drawer (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          {activeCountry ? (
            <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
              {/* Country Inspector Header */}
              <div className="space-y-3 pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CountryFlag
                      code={activeCountry.code}
                      name={activeCountry.name}
                      linkable={false}
                      className="text-lg"
                    />
                    <div>
                      <h3 className="text-xl font-black text-foreground">
                        {activeCountry.name}
                      </h3>
                      {activeCountry.region && (
                        <span className="text-xs text-muted-foreground">
                          Region: {activeCountry.region}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/countries/${activeCountry.code.toLowerCase()}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <span>Full Profile</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-3 text-xs pt-1">
                  <span className="font-semibold text-foreground">
                    {activeCountry.tools.length} Indexed Tools
                  </span>
                  <span>•</span>
                  <span className="text-violet-600 dark:text-violet-400 font-semibold">
                    {activeCountry.tools.filter((t) => t.hiddenGem).length} Hidden Gems
                  </span>
                </div>
              </div>

              {/* Tools from this country list */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {activeCountry.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      tool.hiddenGem
                        ? "border-violet-500/30 bg-violet-500/5 hover:border-violet-500/60"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors block"
                        >
                          {tool.name}
                        </Link>
                        {tool.category && (
                          <span className="text-[10px] text-muted-foreground">
                            {tool.category.name}
                          </span>
                        )}
                      </div>

                      {tool.hiddenGem && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                          Hidden Gem
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tool.tagline}
                    </p>

                    {tool.hiddenGem && tool.hiddenGemReason && (
                      <p className="text-[11px] text-violet-600/90 dark:text-violet-300/90 italic bg-violet-500/10 p-2 rounded-lg line-clamp-2">
                        &ldquo;{tool.hiddenGemReason}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>Specifications</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>

                      <a
                        href={tool.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                      >
                        <span>Visit Site</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card text-muted-foreground">
              Select a country to view indexed developer tools.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
