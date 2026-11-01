"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export interface CompareToolItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  categoryName?: string;
  countryCode?: string;
}

interface CompareContextValue {
  tools: CompareToolItem[];
  addTool: (tool: CompareToolItem) => void;
  removeTool: (slug: string) => void;
  toggleTool: (tool: CompareToolItem) => void;
  isInCompare: (slug: string) => boolean;
  clearCompare: () => void;
  compareUrl: string;
}

const STORAGE_KEY = "devatlas_compare_v1";
const MAX_COMPARE = 4;

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [tools, setTools] = useState<CompareToolItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTools(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
    } catch {
      // ignore
    }
  }, [tools, isLoaded]);

  const isInCompare = useCallback(
    (slug: string) => tools.some((t) => t.slug === slug),
    [tools]
  );

  const addTool = useCallback(
    (tool: CompareToolItem) => {
      setTools((prev) => {
        if (prev.some((t) => t.slug === tool.slug)) {
          toast.info(`${tool.name} is already in comparison`);
          return prev;
        }
        if (prev.length >= MAX_COMPARE) {
          toast.warning(`You can compare up to ${MAX_COMPARE} tools at a time.`);
          return prev;
        }
        toast.success(`Added ${tool.name} to comparison`);
        return [...prev, tool];
      });
    },
    []
  );

  const removeTool = useCallback((slug: string) => {
    setTools((prev) => prev.filter((t) => t.slug !== slug));
  }, []);

  const toggleTool = useCallback(
    (tool: CompareToolItem) => {
      if (isInCompare(tool.slug)) {
        removeTool(tool.slug);
      } else {
        addTool(tool);
      }
    },
    [isInCompare, addTool, removeTool]
  );

  const clearCompare = useCallback(() => {
    setTools([]);
  }, []);

  const compareUrl = `/compare?tools=${tools.map((t) => t.slug).join(",")}`;

  return (
    <CompareContext.Provider
      value={{
        tools,
        addTool,
        removeTool,
        toggleTool,
        isInCompare,
        clearCompare,
        compareUrl,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
