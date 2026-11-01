import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Layers,
  Calendar,
  User as UserIcon,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/country-flag";
import { StackShareButton } from "@/components/stacks/stack-share-button";

export const dynamic = "force-dynamic";

interface StackDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StackDetailPageProps) {
  const { slug } = await params;
  const stack = await prisma.techStack.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!stack) return { title: "Tech Stack Not Found — DevAtlas" };

  return {
    title: `${stack.name} — Tech Stack | DevAtlas`,
    description: stack.description || `Curated engineering stack featuring developer tools from around the world.`,
  };
}

export default async function StackDetailPage({ params }: StackDetailPageProps) {
  const { slug } = await params;

  const stack = await prisma.techStack.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, email: true } },
      tools: {
        include: {
          tool: {
            include: {
              category: true,
              country: true,
              tags: true,
            },
          },
        },
      },
    },
  });

  if (!stack) {
    notFound();
  }

  // Group tools by role
  const roles = ["Frontend", "Backend", "Database", "DevOps", "Utility"];
  const groupedTools = roles.map((role) => ({
    role,
    items: stack.tools.filter((t) => (t.role || "Utility").toLowerCase() === role.toLowerCase()),
  })).filter((group) => group.items.length > 0);

  const markdownContent =
    `### 🛠️ Built with ${stack.name}\n\n` +
    stack.tools
      .map(
        ({ role, tool }) =>
          `- **${role || "Tool"}:** [${tool.name}](${tool.websiteUrl}) — ${tool.tagline}`
      )
      .join("\n") +
    `\n\n*Curated on [DevAtlas](https://devatlas.com/stacks/${stack.slug})*`;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl space-y-12">
      {/* Header */}
      <div className="space-y-4 pb-8 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/stacks"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            ← Back to Stack Builder
          </Link>

          <StackShareButton
            title={stack.name}
            markdownContent={markdownContent}
            stackSlug={stack.slug}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {stack.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              <span>Curated by {stack.user.name || stack.user.email.split("@")[0]}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(stack.createdAt).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{stack.tools.length} Tools</span>
            </span>
          </div>
        </div>

        {stack.description && (
          <p className="text-base text-muted-foreground leading-relaxed pt-2">
            {stack.description}
          </p>
        )}
      </div>

      {/* Grouped Stack Sections */}
      <div className="space-y-10">
        {groupedTools.map(({ role, items }) => (
          <div key={role} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-base font-bold text-foreground uppercase tracking-wide">
                {role} Layer ({items.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(({ tool }) => (
                <div
                  key={tool.id}
                  className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="font-bold text-base text-foreground hover:text-primary transition-colors"
                        >
                          {tool.name}
                        </Link>
                        {tool.country && (
                          <div className="mt-0.5">
                            <CountryFlag
                              code={tool.country.code}
                              name={tool.country.name}
                              linkable={true}
                              className="text-xs"
                            />
                          </div>
                        )}
                      </div>

                      {tool.hiddenGem && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          Hidden Gem
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tool.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Specifications
                    </Link>

                    <a
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground transition-colors"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
