"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PlusCircle, Loader2, LogIn, UserCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const submissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  websiteUrl: z.string().url("Must be a valid URL with https://"),
  categoryId: z.string().optional(),
  countryId: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmitToolDialogProps {
  categories?: Array<{ id: string; name: string }>;
  countries?: Array<{ id: string; code: string; name: string }>;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
  triggerClassName?: string;
  triggerSize?: "default" | "xs" | "sm" | "lg" | "icon";
  triggerLabel?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function SubmitToolDialog({
  categories: initialCategories = [],
  countries: initialCountries = [],
  triggerVariant = "outline",
  triggerClassName,
  triggerSize = "sm",
  triggerLabel = "Submit a Tool",
  showIcon = true,
  children,
}: SubmitToolDialogProps) {
  const { user, openAuthDialog } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [countries] = useState(initialCountries);

  React.useEffect(() => {
    if (open && categories.length === 0) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((res) => {
          if (res?.data) setCategories(res.data);
        })
        .catch((e) => console.error(e));
    }
  }, [open, categories.length]);

  React.useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("devatlas:open-submit-dialog", handleOpen);
    return () => window.removeEventListener("devatlas:open-submit-dialog", handleOpen);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      categoryId: "",
      countryId: "",
    },
  });

  const onSubmit = async (data: SubmissionFormData) => {
    if (!user) {
      toast.error("You must be logged in to submit a tool.");
      setOpen(false);
      openAuthDialog("login", "Please sign in to submit a tool.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to submit tool");
      }

      toast.success("Tool submitted for review! You can track its status in My Submissions.");
      reset();
      setOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during submission.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthDialog("login", "Sign in required: Only logged-in users can submit tools to DevAtlas.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        onClick={handleTriggerClick}
        render={
          children ? (
            children as React.ReactElement
          ) : (
            <Button
              variant={triggerVariant}
              size={triggerSize}
              className={cn("gap-1.5 text-xs font-medium", triggerClassName)}
            >
              {showIcon && <PlusCircle className="h-3.5 w-3.5" />}
              <span>{triggerLabel}</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Submit a Tool</span>
            <Badge variant="outline" className="text-[10px] py-0 border-primary/30 text-primary">
              Members Only
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Know an under-the-radar IT tool or hidden gem that deserves recognition? Suggest it for our directory.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <LogIn className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Authentication Required</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Only authenticated users can submit developer tools for review.
              </p>
            </div>
            <Button
              className="gap-2"
              onClick={() => {
                setOpen(false);
                openAuthDialog("login", "Sign in to submit your developer tool.");
              }}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In or Register</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/60 text-xs">
              <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <div className="truncate flex-1">
                <span className="text-muted-foreground">Submitting as: </span>
                <span className="font-medium text-foreground">{user.name || user.email}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] py-0 capitalize">
                {user.role === "admin" ? "Admin" : "Tool Submitter"}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tool Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Hono, Woodpecker CI, Turborepo"
                {...register("name")}
                className="text-sm"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Official Website URL <span className="text-destructive">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                {...register("websiteUrl")}
                className="text-sm"
              />
              {errors.websiteUrl && (
                <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>
              )}
            </div>

            {categories.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Category
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="">Select category (optional)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {countries.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Country of Origin
                </label>
                <select
                  {...register("countryId")}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="">Select country (optional)</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Submit for Review</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
