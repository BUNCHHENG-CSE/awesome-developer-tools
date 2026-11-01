"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, UserPlus, ShieldAlert, KeyRound, Shield, UserCheck } from "lucide-react";
import { QuickDemoAccounts } from "@/components/quick-demo-accounts";

export function AuthDialog() {
  const {
    isAuthDialogOpen,
    closeAuthDialog,
    authDialogTab,
    authDialogMessage,
    login,
    register,
  } = useAuth();

  const [tab, setTab] = useState<"login" | "register">(authDialogTab);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Sync tab with context when dialog opens
  React.useEffect(() => {
    setTab(authDialogTab);
  }, [authDialogTab, isAuthDialogOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);

    const loggedUser = await login(loginEmail, loginPassword, {
      onUserSuccess: () => {
        // If user came from trying to submit a tool, auto-open the submit tool dialog
        if (authDialogMessage && authDialogMessage.toLowerCase().includes("submit")) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("devatlas:open-submit-dialog"));
          }, 300);
        }
      },
    });

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) return;
    setLoading(true);
    await register(registerName, registerEmail, registerPassword);
    setLoading(false);
  };

  const fillQuickCredentials = (email: string, pass: string) => {
    setTab("login");
    setLoginEmail(email);
    setLoginPassword(pass);
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    setTab("login");
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoading(true);

    await login(email, pass, {
      onUserSuccess: () => {
        if (authDialogMessage && authDialogMessage.toLowerCase().includes("submit")) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("devatlas:open-submit-dialog"));
          }, 300);
        }
      },
    });

    setLoading(false);
  };

  const isDetectedAdmin = loginEmail.toLowerCase().includes("admin");
  const isDetectedSubmitter = Boolean(loginEmail && !isDetectedAdmin);

  return (
    <Dialog open={isAuthDialogOpen} onOpenChange={(open) => !open && closeAuthDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="h-4 w-4" />
            </div>
            <DialogTitle>DevAtlas Account</DialogTitle>
          </div>
          <DialogDescription>
            {authDialogMessage || "Sign in to submit tools or manage directory listings."}
          </DialogDescription>
        </DialogHeader>

        {authDialogMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-snug">{authDialogMessage}</div>
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="text-xs">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs">
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-3">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Email Address</label>
                  {isDetectedAdmin && (
                    <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30 text-[10px] py-0 px-1.5 gap-1">
                      <Shield className="h-2.5 w-2.5" />
                      <span>Role: Administrator</span>
                    </Badge>
                  )}
                  {isDetectedSubmitter && (
                    <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 text-[10px] py-0 px-1.5 gap-1">
                      <UserCheck className="h-2.5 w-2.5" />
                      <span>Role: Tool Submitter</span>
                    </Badge>
                  )}
                </div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoFocus
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                <span>
                  {isDetectedAdmin
                    ? "Sign In as Administrator"
                    : isDetectedSubmitter
                    ? "Sign In as Submitter"
                    : "Sign In"}
                </span>
              </Button>
            </form>

            {/* Quick Demo Logins Helper */}
            <div className="pt-2 border-t border-border/80">
              <QuickDemoAccounts
                onFill={fillQuickCredentials}
                onQuickLogin={handleQuickLogin}
                currentEmail={loginEmail}
                isLoading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 pt-3">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Full Name or Handle</label>
                <Input
                  placeholder="e.g. Alex River"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Password (min 6 characters)</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                  className="text-sm"
                />
              </div>

              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-700 dark:text-sky-300 flex items-center gap-2">
                <UserCheck className="h-4 w-4 shrink-0" />
                <span>New accounts are registered with the <strong>Tool Submitter</strong> role.</span>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                <span>Create Submitter Account</span>
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
