"use client";

import { useState, useCallback } from "react";
import { ManualFilters } from "@/components/search/manual-filters";
import { Navbar } from "@/components/layout/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Database, RefreshCw } from "lucide-react";

interface SearchResult {
  status: "success" | "error";
  message: string;
}

export default function Home() {
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const handleManualSearch = useCallback(async (totalLeads: number, filters: { companyDomains: string[]; jobTitles: string[]; locations: string[]; cities: string[] }) => {
    setIsManualLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalLeads, filters }),
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

  return (
    <div className="min-h-screen bg-[#EBEBEF]">
      <Navbar />

      {/* Main content — full width with padding */}
      <main className="px-6 pt-24 pb-12 lg:px-10">
        <div className="mx-auto max-w-[1800px]">
          {/* Manual Filters — full width */}
          <div>
            <ManualFilters onSubmit={handleManualSearch} isLoading={isManualLoading} />
          </div>

          {/* Result Message */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${
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
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-white px-2.5 py-1.5 text-xs font-medium text-[#6C6C89] transition-colors hover:border-[#A9A9BC] hover:text-[#121217]"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
              <iframe
                key={iframeKey}
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
