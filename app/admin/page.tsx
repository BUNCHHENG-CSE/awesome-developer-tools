"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AdminHeader } from "@/components/admin/admin-header";
import { SubmissionsManager } from "@/components/admin/submissions-manager";
import { ToolsManager } from "@/components/admin/tools-manager";
import { UsersManager } from "@/components/admin/users-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Layers,
  Inbox,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Plus,
} from "lucide-react";

interface StatsData {
  totalTools: number;
  hiddenGemsCount: number;
  featuredCount: number;
  totalCategories: number;
  totalCountries: number;
  totalUsers: number;
  submissions: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  recentSubmissions: Array<{
    id: string;
    name: string;
    websiteUrl: string;
    status: string;
    createdAt: string;
    user: { name: string | null; email: string } | null;
  }>;
}

export default function AdminDashboardPage() {
  const { user, isLoading, isAdmin, openAuthDialog } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/admin");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((res) => {
          if (res?.data) setStats(res.data);
        })
        .catch((e) => console.error(e))
        .finally(() => setStatsLoading(false));
    }
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return null; // redirecting
  }

  // If user is logged in but role is NOT admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-sm text-muted-foreground">
          You are currently signed in as <strong>{user.email}</strong> with role{" "}
          <Badge variant="outline" className="font-semibold text-sky-600 dark:text-sky-400 capitalize">
            {user.role === "user" ? "Tool Submitter" : user.role}
          </Badge>
          . The Admin Console is restricted to administrative accounts.
        </p>
        <div className="pt-2 flex flex-col gap-2 sm:flex-row justify-center">
          <Button
            variant="outline"
            onClick={() => openAuthDialog("login", "Sign in with an admin account (e.g. admin@devatlas.com)")}
          >
            Switch to Admin Account
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader />

      <div className="flex-1 container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
        {/* Page Title & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Console</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Review tool submissions, manage directory entries, and manage user roles.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-4 w-full md:w-auto h-9">
              <TabsTrigger value="overview" className="text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="submissions" className="text-xs gap-1.5">
                <span>Submissions</span>
                {stats && stats.submissions.pending > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {stats.submissions.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">
                Tools Directory
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs">
                Users & Roles
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs flex items-center justify-between">
                    <span>Pending Submissions</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {statsLoading ? "—" : stats?.submissions.pending ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
                  Awaiting review from tool submitters
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs flex items-center justify-between">
                    <span>Total Tools Indexed</span>
                    <Layers className="h-4 w-4 text-primary" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-foreground">
                    {statsLoading ? "—" : stats?.totalTools ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
                  Across {stats?.totalCategories ?? 0} categories
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs flex items-center justify-between">
                    <span>Hidden Gems</span>
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-amber-500">
                    {statsLoading ? "—" : stats?.hiddenGemsCount ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
                  Under-the-radar curated tools
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs flex items-center justify-between">
                    <span>Registered Users</span>
                    <Users className="h-4 w-4 text-sky-500" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-sky-600 dark:text-sky-400">
                    {statsLoading ? "—" : stats?.totalUsers ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
                  Admins & tool submitters
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions Panel */}
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base font-bold">Admin Actions</CardTitle>
                  <CardDescription className="text-xs">
                    Frequent administrative workflows
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-2.5">
                  <Button
                    variant="outline"
                    className="w-full justify-between text-xs h-10 hover:border-amber-500/40 hover:bg-amber-500/5"
                    onClick={() => setActiveTab("submissions")}
                  >
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 text-amber-500" />
                      <span>Review Pending Submissions</span>
                    </div>
                    {stats && stats.submissions.pending > 0 && (
                      <Badge className="bg-amber-500 text-white text-[10px] py-0">
                        {stats.submissions.pending} pending
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between text-xs h-10 hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => setActiveTab("tools")}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-primary" />
                      <span>Add New Tool to Directory</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between text-xs h-10 hover:border-sky-500/40 hover:bg-sky-500/5"
                    onClick={() => setActiveTab("users")}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-500" />
                      <span>Manage Users & Roles</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Submissions Overview */}
              <Card className="lg:col-span-2 border-border/70 shadow-sm">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Recent Submissions</CardTitle>
                    <CardDescription className="text-xs">
                      Latest developer tools submitted by users
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => setActiveTab("submissions")}
                  >
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  {statsLoading ? (
                    <div className="py-8 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No tool submissions yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {stats.recentSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="py-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="truncate flex-1">
                            <span className="font-semibold text-foreground">{sub.name}</span>
                            <span className="text-muted-foreground ml-2 text-[11px] truncate">
                              by {sub.user?.name || sub.user?.email || "Submitter"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] py-0 capitalize ${
                                sub.status === "approved"
                                  ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                                  : sub.status === "rejected"
                                  ? "border-destructive/40 text-destructive"
                                  : "border-amber-500/40 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {sub.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSIONS */}
        {activeTab === "submissions" && <SubmissionsManager />}

        {/* TAB 3: TOOLS DIRECTORY */}
        {activeTab === "tools" && <ToolsManager />}

        {/* TAB 4: USERS & ROLES */}
        {activeTab === "users" && <UsersManager />}
      </div>

      {/* Admin Console Footer */}
      <footer className="border-t border-border/40 py-4 px-6 mt-12 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>DevAtlas Admin Console &bull; Internal Control Panel</span>
        <span className="text-[11px] text-muted-foreground/80">Authorized Access Only</span>
      </footer>
    </div>
  );
}
