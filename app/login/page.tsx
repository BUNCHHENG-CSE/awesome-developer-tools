"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Compass, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { QuickDemoAccounts } from "@/components/quick-demo-accounts";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getRedirectTarget = (role: string) => {
    if (role === "admin") {
      if (redirect === "/" || !redirect || redirect.startsWith("/login")) {
        return "/admin";
      }
      return redirect;
    }

    // Normal users (Submitters) do not have access to /admin console,
    // so fallback to the main landing page "/"
    if (redirect.startsWith("/admin") || redirect.startsWith("/login")) {
      return "/";
    }

    return redirect || "/";
  };

  React.useEffect(() => {
    if (user) {
      const target = getRedirectTarget(user.role);
      router.push(target);
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loggedUser = await login(email, password, {
      redirectOnAdmin: false,
    });
    setLoading(false);
    if (loggedUser) {
      const target = getRedirectTarget(loggedUser.role);
      router.push(target);
    }
  };

  const handleFill = (eMail: string, pass: string) => {
    setEmail(eMail);
    setPassword(pass);
  };

  const handleQuickLogin = async (eMail: string, pass: string) => {
    setEmail(eMail);
    setPassword(pass);
    setLoading(true);
    const loggedUser = await login(eMail, pass, {
      redirectOnAdmin: false,
    });
    setLoading(false);
    if (loggedUser) {
      const target = getRedirectTarget(loggedUser.role);
      router.push(target);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/70 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary via-primary/90 to-violet-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Sign In to DevAtlas</CardTitle>
          <CardDescription>
            Enter your credentials to manage tools and submit entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams.get("error") === "admin_required" && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="leading-snug">
                <strong>Administrator Access Required:</strong> Only admin accounts can access the Admin Console. Please sign in as an Admin.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              <span>
                {email.toLowerCase().includes("admin")
                  ? "Sign In as Administrator"
                  : email
                  ? "Sign In as Submitter"
                  : "Sign In"}
              </span>
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-border/70">
            <QuickDemoAccounts
              onFill={handleFill}
              onQuickLogin={handleQuickLogin}
              currentEmail={email}
              isLoading={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 text-xs text-muted-foreground pt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="ml-1 text-primary hover:underline font-semibold">
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
