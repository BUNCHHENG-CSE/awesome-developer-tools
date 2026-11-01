"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Search,
  Sparkles,
  Menu,
  LogIn,
  LogOut,
  Shield,
  FileText,
  Dices,
  Scale,
  Globe2,
  Bookmark,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search-command";
import { SubmitToolDialog } from "@/components/submit-tool-dialog";
import { GemRouletteDialog } from "@/components/gem-roulette-dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  categories?: Array<{ id: string; name: string }>;
  countries?: Array<{ id: string; code: string; name: string }>;
}

export function SiteHeader({ categories = [], countries = [] }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin, logout, openAuthDialog } = useAuth();

  // Dynamic scroll listener for adaptive frosted glass blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global 'R' key listener for Random Gem Roulette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "r" || e.key === "R") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        setRouletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    {
      href: "/tools",
      label: "Tools",
      mobileLabel: "Tools Directory",
      icon: Layers,
    },
    {
      href: "/hidden-gems",
      label: "Hidden Gems",
      mobileLabel: "Hidden Gems",
      badge: "60+",
      highlight: true,
      icon: Sparkles,
    },
    {
      href: "/atlas",
      label: "Atlas",
      mobileLabel: "World Atlas",
      icon: Globe2,
    },
    {
      href: "/compare",
      label: "Compare",
      mobileLabel: "Compare Tools",
      icon: Scale,
    },
    {
      href: "/alternatives",
      label: "Swaps",
      mobileLabel: "Tool Swaps",
      icon: RefreshCw,
    },
    {
      href: "/stacks",
      label: "Stacks",
      mobileLabel: "Stacks & Saved",
      icon: Bookmark,
    },
  ];

  // Do not render public header on admin console routes (it has its own AdminHeader)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "U";
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          isScrolled
            ? "border-b border-border/80 bg-background/85 backdrop-blur-xl shadow-xs supports-backdrop-filter:bg-background/80"
            : "border-b border-border/40 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60"
        )}
      >
        {/* Ambient bottom hairline gradient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/25 to-transparent opacity-80"
        />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 lg:gap-4">
          {/* Left: Brand Identity & Desktop Navigation */}
          <div className="flex items-center gap-3 xl:gap-6 shrink-0">
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg shrink-0"
              aria-label="DevAtlas Home"
            >
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-primary flex items-center justify-center text-white shadow-sm shadow-violet-500/20 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300 ring-1 ring-white/15 dark:ring-white/10">
                <Compass className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-45" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                DevAtlas
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                      isActive
                        ? "bg-secondary text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      link.highlight &&
                        !isActive &&
                        "text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                    )}
                  >
                    {link.highlight && (
                      <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    )}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Quick Actions, Profile & Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* ⌘K Command Palette Search Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/80 hover:text-foreground border border-border/60 hover:border-border/90 px-2.5 xl:px-3 py-1.5 rounded-full transition-all duration-200 w-32 xl:w-48 justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-2xs cursor-pointer"
              aria-label="Open search palette"
            >
              <span className="flex items-center gap-1.5 xl:gap-2 truncate">
                <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                <span className="truncate">Search...</span>
              </span>
              <kbd className="pointer-events-none hidden xl:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border/80 bg-background/90 px-1.5 font-mono text-[9px] font-semibold text-muted-foreground group-hover:border-foreground/30 shadow-2xs transition-colors">
                <span>⌘</span>K
              </kbd>
            </button>

            {/* Mobile Search Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setCommandOpen(true)}
              aria-label="Search tools"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Surprise Me / Gem Roulette Button */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => setRouletteOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold h-8 px-2.5 xl:px-3 rounded-full border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/15 text-violet-600 dark:text-violet-300 hover:border-violet-500/50 transition-all duration-200 cursor-pointer shadow-2xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Spin Random Hidden Gem"
                  >
                    <Dices className="h-3.5 w-3.5 text-violet-500 group-hover:rotate-180 transition-transform duration-500 shrink-0" />
                    <span className="hidden xl:inline">Surprise Me</span>
                    <kbd className="hidden 2xl:inline-block text-[9px] font-mono font-medium px-1 py-0.2 rounded bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
                      R
                    </kbd>
                  </button>
                }
              />
              <TooltipContent side="bottom" className="text-xs">
                Spin Random Hidden Gem (Press &apos;R&apos;)
              </TooltipContent>
            </Tooltip>

            {/* Submit Tool Dialog - Primary CTA */}
            <div className="hidden sm:block">
              <SubmitToolDialog
                categories={categories}
                countries={countries}
                triggerVariant="default"
                triggerClassName="h-8 px-3 xl:px-3.5 rounded-full font-semibold text-xs gap-1.5 shadow-sm shadow-primary/15 hover:shadow-primary/25 transition-all"
                triggerLabel="Submit Tool"
                showIcon={true}
              />
            </div>

            {/* Admin Console shortcut button for logged-in admins */}
            {user && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin")}
                className="hidden xl:inline-flex items-center gap-1.5 text-xs h-8 px-3 rounded-full border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Button>
            )}

            {/* Subtle Divider */}
            <div className="hidden sm:block h-4 w-px bg-border/60 mx-0.5" />

            {/* User Profile or Sign In */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted border border-border/60 hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                      aria-label="User menu"
                    >
                      <Avatar className="h-6 w-6 ring-1 ring-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium max-w-[80px] truncate hidden md:inline text-foreground">
                        {user.name || user.email.split("@")[0]}
                      </span>
                      <Badge
                        variant={isAdmin ? "default" : "secondary"}
                        className={`text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider ${
                          isAdmin
                            ? "bg-violet-600 text-white hover:bg-violet-600"
                            : "border-sky-500/30 text-sky-600 dark:text-sky-400"
                        }`}
                      >
                        {isAdmin ? "Admin" : "Submitter"}
                      </Badge>
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold leading-none truncate text-foreground">
                            {user.name || "User"}
                          </p>
                          <Badge
                            variant={isAdmin ? "default" : "secondary"}
                            className="text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider"
                          >
                            {isAdmin ? "Admin" : "Submitter"}
                          </Badge>
                        </div>
                        <p className="text-[11px] leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => router.push("/admin")}
                        className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 cursor-pointer"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => router.push("/stacks")}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Saved Tools & Stacks</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => router.push("/my-submissions")}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>My Submissions</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthDialog("login")}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs h-8 px-2.5 rounded-full font-medium text-muted-foreground hover:text-foreground"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle className="h-8 w-8" />

            {/* Mobile Drawer Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-80 p-6 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Drawer Header */}
                  <SheetHeader className="text-left pb-3 border-b border-border/50">
                    <SheetTitle className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-base tracking-tight">DevAtlas</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Global IT Directory</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Mobile Search Button */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCommandOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5" />
                      <span>Search tools, stacks...</span>
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border">⌘K</kbd>
                  </button>

                  {/* User Profile Card (if logged in) */}
                  {user ? (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate text-foreground">
                            {user.name || "User"}
                          </p>
                          <Badge
                            variant={isAdmin ? "default" : "secondary"}
                            className="text-[9px] py-0 px-1 font-bold"
                          >
                            {isAdmin ? "Admin" : "Member"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Navigation Links Group */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 px-3 py-1">
                      Explore
                    </span>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                            isActive
                              ? "bg-secondary text-foreground font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            link.highlight && !isActive && "text-violet-600 dark:text-violet-400"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={cn("h-4 w-4", link.highlight ? "text-violet-500" : "text-muted-foreground")} />
                            <span>{link.mobileLabel || link.label}</span>
                          </div>
                          {link.badge && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    {user && (
                      <Link
                        href="/my-submissions"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        <span>My Submissions</span>
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  {/* Surprise Me Roulette Mobile Card */}
                  <div
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setRouletteOpen(true);
                    }}
                    className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-300 group-hover:rotate-180 transition-transform duration-500">
                        <Dices className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Surprise Me</p>
                        <p className="text-[10px] text-muted-foreground">Discover a random hidden gem</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold border border-violet-500/25">
                      Press R
                    </span>
                  </div>

                  {/* Actions & Dialogs */}
                  <div className="pt-2 border-t border-border/50 space-y-2">
                    <SubmitToolDialog
                      categories={categories}
                      countries={countries}
                      triggerVariant="default"
                      triggerClassName="w-full justify-center h-9 rounded-xl font-semibold"
                      triggerLabel="Submit a Tool"
                      showIcon={true}
                    />

                    {user ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start gap-2 h-9 rounded-xl"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 h-9 rounded-xl"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthDialog("login");
                        }}
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Sign In / Register</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>DevAtlas Directory</span>
                  <span>© {new Date().getFullYear()}</span>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Global Command Dialog */}
      <SearchCommand open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Random Hidden Gem Roulette */}
      <GemRouletteDialog open={rouletteOpen} onOpenChange={setRouletteOpen} />
    </>
  );
}