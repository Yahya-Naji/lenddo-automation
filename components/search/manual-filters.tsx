"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Send,
  Loader2,
  X,
  Check,
  ChevronDown,
  Building2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  domain: string;
}

interface CompanyRow {
  company: Company;
  selectedTitles: string[];
}

interface SearchFilters {
  companyDomains: string[];
  jobTitles: string[];
  locations: string[];
  cities: string[];
}

interface ManualFiltersProps {
  onSubmit: (totalLeads: number, filters: SearchFilters) => Promise<void>;
  isLoading: boolean;
}

const COMMON_TITLES = [
  "CEO", "CFO", "COO", "CTO", "CMO", "CHRO", "CIO",
  "Founder", "Co-Founder", "Owner", "President", "Chairman", "Board Member",
  "Managing Director", "Executive Director", "General Manager", "Managing Partner",
  "Partner", "Senior Partner", "Associate Partner",
  "Director", "Senior Director", "Associate Director",
  "Vice President", "Senior Vice President", "Executive Vice President",
  "Principal", "Manager", "Senior Manager", "Head of",
];

const UAE_LOCATIONS = [
  "United Arab Emirates",
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
];

// Cities that map to contact_city; everything else is a country → contact_location
const UAE_CITIES: Record<string, string> = {
  "Dubai": "dubai",
  "Abu Dhabi": "abu dhabi",
  "Sharjah": "sharjah",
  "Ajman": "ajman",
  "Ras Al Khaimah": "ras al khaimah",
  "Fujairah": "fujairah",
};

// ─── Combobox ─────────────────────────────────────────────────────────────────
function Combobox({
  label,
  placeholder,
  options,
  selected,
  onChange,
  isLoading,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(filter.toLowerCase())
  );

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value]
    );
  };

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-[#6C6C89]">{label}</label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-lg bg-[#121217] px-2.5 py-1 text-xs font-medium text-white"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(selected.filter((s) => s !== v))}
                className="ml-0.5 rounded-full p-0.5 hover:bg-white/20 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((prev) => {
            if (!prev) setTimeout(() => inputRef.current?.focus(), 50);
            return !prev;
          });
        }}
        disabled={isLoading}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all duration-200",
          open
            ? "border-[#121217] bg-white ring-1 ring-[#121217]"
            : "border-[#E4E4E7] bg-[#F7F7F8] hover:border-[#A9A9BC]",
          isLoading && "cursor-wait opacity-60"
        )}
      >
        <span className={cn("truncate", selected.length === 0 && "text-[#A9A9BC]")}>
          {isLoading
            ? "Loading..."
            : selected.length > 0
            ? `${selected.length} selected`
            : placeholder}
        </span>
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#A9A9BC]" />
        ) : (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[#6C6C89] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-lg"
          >
            <div className="border-b border-[#E4E4E7] p-2">
              <div className="flex items-center gap-2 rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-[#A9A9BC]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={`Filter ${label.toLowerCase()}...`}
                  className="w-full bg-transparent text-xs text-[#121217] placeholder:text-[#A9A9BC] focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto p-1.5">
              {filter.trim() && !options.includes(filter.trim()) && !selected.includes(filter.trim()) && (
                <button
                  type="button"
                  onClick={() => { onChange([...selected, filter.trim()]); setFilter(""); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#121217] hover:bg-[#F7F7F8]"
                >
                  <span className="text-[#6C6C89] text-xs">Add</span>
                  <span className="font-medium">"{filter.trim()}"</span>
                </button>
              )}
              {filtered.length === 0 && !filter.trim() ? (
                <p className="px-3 py-4 text-center text-xs text-[#A9A9BC]">No matches found</p>
              ) : filtered.length === 0 && filter.trim() ? null : (
                filtered.map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggle(option)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                        isSelected
                          ? "bg-[#F7F7F8] font-medium text-[#121217]"
                          : "text-[#121217] hover:bg-[#F7F7F8]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected ? "border-[#121217] bg-[#121217]" : "border-[#D4D4D8]"
                        )}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </span>
                      <span className="truncate">{option}</span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─── ManualFilters ────────────────────────────────────────────────────────────
export function ManualFilters({ onSubmit, isLoading }: ManualFiltersProps) {
  // Company search
  const [companyQuery, setCompanyQuery] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companyRows, setCompanyRows] = useState<CompanyRow[]>([]);
  const companyRef = useRef<HTMLDivElement>(null);

  // Shared filters
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced company search
  useEffect(() => {
    if (!companyQuery || companyQuery.length < 2) {
      setCompanySuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const t = setTimeout(() => fetchCompanies(companyQuery), 400);
    return () => clearTimeout(t);
  }, [companyQuery]);

  const fetchCompanies = async (query: string) => {
    setCompanyLoading(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setCompanySuggestions(data.companies || []);
      setShowSuggestions(true);
    } catch {
      setCompanySuggestions([]);
    } finally {
      setCompanyLoading(false);
    }
  };

  const [totalLeads, setTotalLeads] = useState<number>(25);

  const selectCompany = useCallback((company: Company) => {
    setCompanyRows((prev) =>
      prev.find((r) => r.company.id === company.id)
        ? prev
        : [...prev, { company, selectedTitles: [] }]
    );
    setShowSuggestions(false);
    setCompanyQuery("");
    setCompanySuggestions([]);
  }, []);

  const removeCompany = (id: string) => {
    setCompanyRows((prev) => prev.filter((r) => r.company.id !== id));
  };

  const updateRowTitles = (companyId: string, titles: string[]) => {
    setCompanyRows((prev) =>
      prev.map((r) => (r.company.id === companyId ? { ...r, selectedTitles: titles } : r))
    );
  };

  const isValid =
    companyRows.length > 0 &&
    companyRows.some((r) => r.selectedTitles.length > 0) &&
    selectedLocations.length > 0 &&
    totalLeads >= 1 &&
    totalLeads <= 500;

  const buildFilters = () => {
    const companyDomains = companyRows
      .filter((r) => r.selectedTitles.length > 0)
      .map((r) => r.company.domain);

    const jobTitles = [...new Set(companyRows.flatMap((r) => r.selectedTitles))];

    const cityList = selectedLocations.filter((l) => UAE_CITIES[l]);
    const countrySet = new Set(
      selectedLocations.filter((l) => !UAE_CITIES[l]).map((l) => l.toLowerCase())
    );
    if (cityList.length > 0) countrySet.add("united arab emirates");

    return {
      companyDomains,
      jobTitles,
      locations: [...countrySet],
      cities: cityList.map((l) => UAE_CITIES[l]),
    };
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSubmit(totalLeads, buildFilters());
  };

  const handleClear = () => {
    setCompanyRows([]);
    setCompanyQuery("");
    setCompanySuggestions([]);
    setSelectedLocations([]);
    setTotalLeads(25);
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
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F7F8]">
            <SlidersHorizontal className="h-5 w-5 text-[#121217]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#121217]">Search Leads</h2>
            <p className="text-xs text-[#6C6C89]">
              Add companies, pick job titles per company, then filter by location
            </p>
          </div>
        </div>

        {/* ── Company Search ── */}
        <div ref={companyRef} className="relative mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[#6C6C89]">Add Company</label>
          <div className="relative">
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-[#F7F7F8] px-3 py-2 transition-all duration-200",
                showSuggestions
                  ? "border-[#121217] bg-white ring-1 ring-[#121217]"
                  : "border-[#E4E4E7]"
              )}
            >
              {companyLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#A9A9BC]" />
              ) : (
                <Search className="h-4 w-4 shrink-0 text-[#A9A9BC]" />
              )}
              <input
                type="text"
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
                placeholder="Search company name..."
                className="w-full bg-transparent text-sm text-[#121217] placeholder:text-[#A9A9BC] focus:outline-none"
              />
              {companyQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCompanyQuery("");
                    setCompanySuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="text-[#A9A9BC] hover:text-[#6C6C89] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-lg"
                >
                  {companySuggestions.length === 0 ? (
                    <p className="px-4 py-4 text-center text-xs text-[#A9A9BC]">
                      No companies found
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto p-1.5">
                      {companySuggestions.map((company) => {
                        const alreadyAdded = companyRows.some((r) => r.company.id === company.id);
                        return (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => !alreadyAdded && selectCompany(company)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                              alreadyAdded
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-[#F7F7F8]"
                            )}
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F7F7F8]">
                              <Building2 className="h-3.5 w-3.5 text-[#6C6C89]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-[#121217]">
                                {company.name}
                              </p>
                              {company.domain && (
                                <p className="truncate text-xs text-[#A9A9BC]">{company.domain}</p>
                              )}
                            </div>
                            {alreadyAdded && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-[#6C6C89]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Company Rows ── */}
        <AnimatePresence initial={false}>
          {companyRows.map((row) => (
            <motion.div
              key={row.company.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mb-3 rounded-xl border border-[#E4E4E7] bg-[#F7F7F8] p-3"
            >
              {/* Row header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white border border-[#E4E4E7]">
                    <Building2 className="h-3.5 w-3.5 text-[#6C6C89]" />
                  </div>
                  <span className="text-sm font-medium text-[#121217]">{row.company.name}</span>
                  {row.company.domain && (
                    <span className="text-xs text-[#A9A9BC]">{row.company.domain}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeCompany(row.company.id)}
                    className="rounded-lg p-1 text-[#A9A9BC] hover:bg-white hover:text-[#121217] transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Per-company job titles */}
              <Combobox
                label="Job Titles"
                placeholder="Select or type a job title..."
                options={COMMON_TITLES}
                selected={row.selectedTitles}
                onChange={(titles: string[]) => updateRowTitles(row.company.id, titles)}
                isLoading={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── Shared Location + Submit (after at least one company added) ── */}
        <AnimatePresence>
          {companyRows.length > 0 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pt-1"
            >
              <Combobox
                label="Location"
                placeholder="Select UAE locations..."
                options={UAE_LOCATIONS}
                selected={selectedLocations}
                onChange={setSelectedLocations}
                isLoading={false}
              />

              <div className="flex items-end justify-between gap-4 pt-2">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[#6C6C89]">Total leads (max 500)</p>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={totalLeads}
                    onChange={(e) => setTotalLeads(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-32 rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] px-3 py-2 text-sm font-semibold text-[#121217] focus:border-[#121217] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#121217] transition-all duration-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6C6C89] transition-colors hover:bg-[#F7F7F8] hover:text-[#121217]"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-300",
                      isValid && !isLoading
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}
