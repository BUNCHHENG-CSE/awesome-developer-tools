"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Shield,
  ArrowUpRight,
  LogOut,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { SearchCommand } from "@/components/search-command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "A";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Admin Console Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-foreground">
                  DevAtlas
                </span>
                <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 text-[10px] py-0.5 px-2 font-bold uppercase tracking-wider">
                  Admin Console
                </Badge>
              </div>
            </Link>

            {/* Active System Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Console Active</span>
            </div>
          </div>

          {/* Center: Quick Search Directory Trigger */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 hover:bg-muted border border-border/70 hover:border-border px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500/40 w-48 lg:w-64 justify-between"
              aria-label="Search directory"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">Search directory...</span>
              </span>
              <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right: Actions & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-muted-foreground"
              onClick={() => setCommandOpen(true)}
              aria-label="Search directory"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Quick link to public site */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 text-xs h-9 border-border/80 hover:bg-muted font-medium"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Compass className="h-3.5 w-3.5 text-violet-500" />
                <span className="hidden sm:inline">View Public Site</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              </Link>
            </Button>

            <ThemeToggle />

            {/* Admin User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/80 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-colors"
                      aria-label="Admin user menu"
                    >
                      <Avatar className="h-7 w-7 ring-1 ring-violet-500/30">
                        <AvatarFallback className="bg-violet-600/10 text-violet-600 dark:text-violet-400 font-bold text-xs">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold max-w-[100px] truncate hidden md:inline text-foreground">
                        {user.name || user.email.split("@")[0]}
                      </span>
                      <Badge className="text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider bg-violet-600 text-white hover:bg-violet-600">
                        Admin
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
                            {user.name || "DevAtlas Admin"}
                          </p>
                          <Badge className="text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider bg-violet-600 text-white">
                            Admin
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
                    <DropdownMenuItem
                      onClick={() => router.push("/")}
                      className="cursor-pointer text-xs gap-2 py-2"
                    >
                      <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>View Public Site</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/tools")}
                      className="cursor-pointer text-xs gap-2 py-2"
                    >
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Explore Tools Directory</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/hidden-gems")}
                      className="cursor-pointer text-xs gap-2 py-2"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                      <span>Hidden Gems Leaderboard</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-xs gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog Accessible from Admin Header */}
      <SearchCommand open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
