"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { SubmitToolDialog } from "@/components/submit-tool-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  PlusCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

interface Submission {
  id: string;
  name: string;
  websiteUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  createdAt: string;
  categoryName?: string;
}

export default function MySubmissionsPage() {
  const { user, isLoading: authLoading, openAuthDialog } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/submissions?myOnly=true");
      if (res.ok) {
        const json = await res.json();
        setSubmissions(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load submissions:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSubmissions();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, loadSubmissions]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Sign in to view your submissions</h2>
        <p className="text-sm text-muted-foreground">
          Track the status of developer tools and hidden gems you have suggested for the DevAtlas directory.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button onClick={() => openAuthDialog("login")} className="gap-2">
            Sign In
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 hover:bg-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved & Published</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 hover:bg-amber-500/20">
            <Clock className="h-3 w-3" />
            <span>Pending Review</span>
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Directory</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Tool Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Tools and utilities suggested by{" "}
            <span className="font-semibold text-foreground">{user.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSubmissions}
            disabled={loading}
            className="gap-1.5 text-xs h-9"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <SubmitToolDialog triggerVariant="default" />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="border-dashed border-2 border-border/80 bg-card/50 text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">No submissions yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Know a great developer tool, hidden framework, or DevOps utility? Submit it to help other developers discover it.
              </p>
            </div>
            <div className="pt-2">
              <SubmitToolDialog triggerVariant="default" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <Card key={sub.id} className="border-border/70 shadow-sm hover:border-border transition-colors">
              <CardHeader className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <CardTitle className="text-lg font-bold">{sub.name}</CardTitle>
                      {getStatusBadge(sub.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <span>Submitted on {new Date(sub.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <a
                        href={sub.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>{sub.websiteUrl}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardDescription>
                  </div>
                </div>

                {sub.status === "rejected" && sub.rejectionReason && (
                  <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Review note: </span>
                      {sub.rejectionReason}
                    </div>
                  </div>
                )}

                {sub.status === "approved" && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>This tool was reviewed and successfully accepted into the DevAtlas directory!</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                      <Link href="/tools">Explore Directory</Link>
                    </Button>
                  </div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
