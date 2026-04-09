"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { ManualFilters } from "@/components/search/manual-filters";
import { QuickFilters } from "@/components/search/quick-filters";
import { Navbar } from "@/components/layout/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Database } from "lucide-react";

interface SearchResult {
  status: "success" | "error";
  message: string;
  filters?: Record<string, unknown>;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
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

  const handleManualSearch = useCallback(async (queryString: string) => {
    setIsManualLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryString }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          status: "error",
          message: data.error || "Search failed.",
        });
        return;
      }

      setResult({
        status: "success",
        message: data.message,
      });
    } catch {
      setResult({
        status: "error",
        message: "Network error. Is the server running?",
      });
    } finally {
      setIsManualLoading(false);
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
      <Navbar />

      {/* Main content — full width with padding */}
      <main className="px-6 pt-24 pb-12 lg:px-10">
        <div className="mx-auto max-w-[1800px]">
          {/* Two-column layout: AI search + quick filters */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left — AI Search */}
            <div className="space-y-5">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />

              {/* Result Message */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${
                      result.status === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-red-200 bg-red-50 text-red-800"
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
            </div>

            {/* Right — Quick filters sidebar */}
            <div>
              <QuickFilters onSelect={handleQuickFilter} />
            </div>
          </div>

          {/* Manual Filters — full width, directly above Lead Database */}
          <div className="mt-8">
            <ManualFilters onSubmit={handleManualSearch} isLoading={isManualLoading} />
          </div>

          {/* Airtable View — full width */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8"
          >
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-[#6C6C89]" />
              <h2 className="text-sm font-semibold text-[#121217]">Lead Database</h2>
              <div className="h-px flex-1 bg-[#E4E4E7]" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
              <iframe
                className="w-full border-0"
                src="https://airtable.com/embed/appUpWbEYlFqyhq47/shrwFyCZ9uM5NiIhC"
                height="700"
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
