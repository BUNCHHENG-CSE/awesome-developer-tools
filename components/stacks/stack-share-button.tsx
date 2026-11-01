"use client";

import React, { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StackShareButtonProps {
  title: string;
  markdownContent: string;
  stackSlug: string;
}

export function StackShareButton({
  title,
  markdownContent,
  stackSlug,
}: StackShareButtonProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Stack URL copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    toast.success("Markdown snippet copied! Paste in your README.");
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyMarkdown}
        className="text-xs h-9 gap-1.5"
      >
        {copiedMd ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        <span>Copy README Snippet</span>
      </Button>

      <Button
        size="sm"
        onClick={copyLink}
        className="text-xs h-9 gap-1.5 font-semibold"
      >
        {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
        <span>Share Stack</span>
      </Button>
    </div>
  );
}
