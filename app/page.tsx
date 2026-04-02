"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { QuickFilters } from "@/components/search/quick-filters";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Zap } from "lucide-react";

interface SearchResult {
  status: "success" | "error";
  message: string;
  filters?: Record<string, unknown>;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = useCallback(async (query: string, source: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          status: "error",
          message: data.error || "Search failed. Check your API keys.",
        });
        return;
      }

      setResult({
        status: "success",
        message: data.message,
        filters: data.filters,
      });
    } catch {
      setResult({
        status: "error",
        message: "Network error. Is the server running?",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQuickFilter = useCallback(
    (query: string) => {
      handleSearch(query, "Apollo");
    },
    [handleSearch]
  );

  return (
    <div className="min-h-screen bg-[#EBEBEF]">
      <div className="mx-auto max-w-6xl px-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 pt-8 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#121217]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#121217]">Lenddoo Lead Gen</h1>
            <p className="text-xs text-[#6C6C89]">Search 240M+ contacts for mortgage prospects</p>
          </div>
        </div>

        {/* Quick Filters */}
        <QuickFilters onSelect={handleQuickFilter} />

        {/* Search */}
        <div className="mt-5">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Result Message */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`mt-5 flex items-start gap-3 rounded-2xl p-4 ${
                result.status === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {result.status === "success" ? (
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              )}
              <p className="text-sm">{result.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Airtable View */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm"
        >
          <iframe
            className="w-full border-0"
            src="https://airtable.com/embed/appUpWbEYlFqyhq47/shrwFyCZ9uM5NiIhC"
            height="700"
          />
        </motion.div>
      </div>
    </div>
  );
}
