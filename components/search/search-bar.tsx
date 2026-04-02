"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOURCES } from "@/lib/constants";

interface SearchBarProps {
  onSearch: (query: string, source: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<string>("Apollo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim(), source);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7F7F8]">
            <Sparkles className="h-5 w-5 text-[#121217]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#121217]">AI-Powered Search</h2>
            <p className="text-xs text-[#6C6C89]">Describe who you&apos;re looking for in plain English</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "Find expats in finance who just moved to Dubai, earning 25K+ AED"'
            rows={3}
            className="w-full resize-none rounded-2xl border border-[#E4E4E7] bg-[#F7F7F8] px-5 py-4 text-base text-[#121217] placeholder:text-[#A9A9BC] focus:border-[#121217] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#121217] transition-all duration-300"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#6C6C89]">Source:</span>
            <div className="flex rounded-xl bg-[#F7F7F8] p-1">
              {SOURCES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={cn(
                    "rounded-lg px-4 py-1.5 text-xs font-medium transition-all duration-200",
                    source === s
                      ? "bg-[#121217] text-white shadow-sm"
                      : "text-[#6C6C89] hover:text-[#121217]"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={cn(
              "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-300",
              query.trim() && !isLoading
                ? "bg-[#121217] text-white hover:bg-[#2a2a35] shadow-sm hover:shadow-md active:scale-[0.98]"
                : "bg-[#E4E4E7] text-[#A9A9BC] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Run Search
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
