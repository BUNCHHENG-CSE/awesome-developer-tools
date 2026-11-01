import Link from "next/link";
import { Compass, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-6">
      <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground">
        <Compass className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">404 — Page Not Found</h1>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          The tool, category, or country you are looking for doesn&apos;t exist or has been relocated in the atlas.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button asChild variant="default" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Atlas Home</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/search">
            <Search className="h-4 w-4" />
            <span>Search All Tools</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
