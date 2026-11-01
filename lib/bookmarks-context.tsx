"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";

export interface BookmarkedTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  categoryName?: string;
  countryCode?: string;
}

interface BookmarksContextValue {
  bookmarks: BookmarkedTool[];
  isBookmarked: (toolId: string) => boolean;
  toggleBookmark: (tool: BookmarkedTool) => Promise<void>;
  clearBookmarks: () => void;
  count: number;
}

const STORAGE_KEY = "devatlas_bookmarks_v1";

const BookmarksContext = createContext<BookmarksContextValue | undefined>(undefined);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedTool[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage first
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks, isLoaded]);

  // If user is authenticated, sync with server
  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    async function syncWithServer() {
      try {
        const res = await fetch("/api/bookmarks");
        if (!res.ok) return;
        const json = await res.json();
        if (json.data && !isCancelled) {
          const serverItems: BookmarkedTool[] = json.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            tagline: t.tagline,
            categoryName: t.category?.name,
            countryCode: t.country?.code,
          }));

          // Merge local and server without duplicates
          setBookmarks((prev) => {
            const map = new Map<string, BookmarkedTool>();
            serverItems.forEach((item) => map.set(item.id, item));
            prev.forEach((item) => {
              if (!map.has(item.id)) {
                map.set(item.id, item);
                // Also save un-synced local item to server
                fetch("/api/bookmarks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ toolId: item.id }),
                }).catch(() => {});
              }
            });
            return Array.from(map.values());
          });
        }
      } catch {
        // ignore
      }
    }

    syncWithServer();
    return () => {
      isCancelled = true;
    };
  }, [user]);

  const isBookmarked = useCallback(
    (toolId: string) => bookmarks.some((b) => b.id === toolId),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (tool: BookmarkedTool) => {
      const currentlyBookmarked = bookmarks.some((b) => b.id === tool.id);

      if (currentlyBookmarked) {
        setBookmarks((prev) => prev.filter((b) => b.id !== tool.id));
        toast.info(`Removed ${tool.name} from bookmarks`);

        if (user) {
          try {
            await fetch(`/api/bookmarks?toolId=${tool.id}`, { method: "DELETE" });
          } catch {
            // ignore
          }
        }
      } else {
        setBookmarks((prev) => [...prev, tool]);
        toast.success(`Saved ${tool.name} to bookmarks`);

        if (user) {
          try {
            await fetch("/api/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ toolId: tool.id }),
            });
          } catch {
            // ignore
          }
        }
      }
    },
    [bookmarks, user]
  );

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        clearBookmarks,
        count: bookmarks.length,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}
