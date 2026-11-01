import React from "react";
import Link from "next/link";
import {
  FileCode2,
  Globe,
  Server,
  Workflow,
  Boxes,
  Database,
  Activity,
  Cloud,
  Wrench,
  TerminalSquare,
  Folder,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  FileCode2,
  Globe,
  Server,
  Workflow,
  Boxes,
  Database,
  Activity,
  Cloud,
  Wrench,
  TerminalSquare,
};

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    _count?: {
      tools: number;
    };
    hiddenGemsCount?: number;
  };
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const IconComponent = (category.icon && ICON_MAP[category.icon]) || Folder;
  const toolCount = category._count?.tools ?? 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl"
    >
      <Card
        className={cn(
          "h-full border border-border/60 bg-card hover:bg-card/80 transition-all duration-200 hover:shadow-md hover:border-primary/40 group-hover:-translate-y-0.5",
          className
        )}
      >
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <IconComponent className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
              {toolCount} {toolCount === 1 ? "tool" : "tools"}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              <span>{category.name}</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
            </h3>
            {category.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          {category.hiddenGemsCount !== undefined && category.hiddenGemsCount > 0 && (
            <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-violet-600 dark:text-violet-400 font-medium">
              <Sparkles className="h-3 w-3" />
              <span>{category.hiddenGemsCount} hidden gems</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
