"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Plus, X, Send, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManualFiltersProps {
  onSubmit: (queryString: string) => Promise<void>;
  isLoading: boolean;
}

const PER_PAGE_PRESETS = ["10", "20", "25", "50", "100"];

function TagInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addValue = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6C6C89]">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] px-3 py-2 text-sm text-[#121217] placeholder:text-[#A9A9BC] focus:border-[#121217] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#121217] transition-all duration-200"
        />
        <button
          type="button"
          onClick={addValue}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] text-[#6C6C89] transition-colors hover:bg-[#121217] hover:text-white hover:border-[#121217]"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-lg bg-[#121217] px-2.5 py-1 text-xs font-medium text-white"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="ml-0.5 rounded-full p-0.5 hover:bg-white/20 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PerPageDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCustomSubmit = () => {
    const num = parseInt(customInput, 10);
    if (num > 0) {
      onChange(String(num));
      setCustomInput("");
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-[#6C6C89]">
        Results per page
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
          open
            ? "border-[#121217] bg-white ring-1 ring-[#121217]"
            : "border-[#E4E4E7] bg-[#F7F7F8] hover:border-[#A9A9BC]"
        )}
      >
        <span className="text-[#121217]">{value}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[#6C6C89] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-lg"
          >
            <div className="p-1.5">
              {PER_PAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onChange(preset);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                    value === preset
                      ? "bg-[#121217] font-medium text-white"
                      : "text-[#121217] hover:bg-[#F7F7F8]"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="border-t border-[#E4E4E7] p-2">
              <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-[#A9A9BC]">
                Custom
              </p>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomSubmit();
                    }
                  }}
                  placeholder="e.g. 75"
                  className="w-full rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] px-2.5 py-1.5 text-xs text-[#121217] placeholder:text-[#A9A9BC] focus:border-[#121217] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#121217] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  className="shrink-0 rounded-lg bg-[#121217] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2a2a35]"
                >
                  Set
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ManualFilters({ onSubmit, isLoading }: ManualFiltersProps) {
  const [titles, setTitles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [perPage, setPerPage] = useState("25");

  const buildQueryString = (): string => {
    const parts: string[] = [];

    for (const t of titles) {
      parts.push(`person_titles[]=${encodeURIComponent(t)}`);
    }
    for (const l of locations) {
      parts.push(`person_locations[]=${encodeURIComponent(l)}`);
    }
    for (const d of domains) {
      parts.push(`q_organization_domains_list[]=${encodeURIComponent(d)}`);
    }
    parts.push(`per_page=${encodeURIComponent(perPage)}`);

    return parts.join("&");
  };

  const hasFilters = titles.length > 0 || locations.length > 0 || domains.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFilters || isLoading) return;
    onSubmit(buildQueryString());
  };

  const handleClear = () => {
    setTitles([]);
    setLocations([]);
    setDomains([]);
    setPerPage("25");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F7F8]">
            <SlidersHorizontal className="h-5 w-5 text-[#121217]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#121217]">Manual Filters</h2>
            <p className="text-xs text-[#6C6C89]">Build your Apollo search with specific fields</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Row 1: Titles + Locations */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TagInput
              label="Job Titles"
              placeholder="e.g. Principal, VP of Finance"
              values={titles}
              onChange={setTitles}
            />
            <TagInput
              label="Locations"
              placeholder="e.g. United Arab Emirates, Dubai"
              values={locations}
              onChange={setLocations}
            />
          </div>

          {/* Row 2: Domains */}
          <TagInput
            label="Company Domains"
            placeholder="e.g. kearney.com"
            values={domains}
            onChange={setDomains}
          />

          {/* Per page + actions */}
          <div className="flex items-end justify-between gap-4 pt-2">
            <PerPageDropdown value={perPage} onChange={setPerPage} />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6C6C89] transition-colors hover:bg-[#F7F7F8] hover:text-[#121217]"
              >
                Clear All
              </button>
              <button
                type="submit"
                disabled={!hasFilters || isLoading}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-300",
                  hasFilters && !isLoading
                    ? "bg-[#121217] text-white hover:bg-[#2a2a35] shadow-sm hover:shadow-md active:scale-[0.98]"
                    : "bg-[#E4E4E7] text-[#A9A9BC] cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Run Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
