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
  perPage: string;
}

interface ManualFiltersProps {
  onSubmit: (queryStrings: string[]) => Promise<void>;
  isLoading: boolean;
}

const PER_PAGE_PRESETS = ["10", "25", "50", "100"];

const UAE_LOCATIONS = [
  "united arab emirates",
  "dubai, united arab emirates",
  "abu dhabi, united arab emirates",
  "sharjah, united arab emirates",
  "ajman, united arab emirates",
  "ras al khaimah, united arab emirates",
  "fujairah, united arab emirates",
];

// ─── ApolloCombobox ──────────────────────────────────────────────────────────
function ApolloCombobox({
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
            ? "Loading from Apollo..."
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
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-[#A9A9BC]">
                  {options.length === 0 ? "No data returned from Apollo" : "No matches found"}
                </p>
              ) : (
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

// ─── PerPageDropdown ─────────────────────────────────────────────────────────
function PerPageDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCustomSubmit = () => {
    const num = parseInt(customInput, 10);
    if (num > 0) { onChange(String(num)); setCustomInput(""); setOpen(false); }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-200",
          open ? "border-[#121217] bg-white ring-1 ring-[#121217]" : "border-[#E4E4E7] bg-white hover:border-[#A9A9BC]"
        )}
      >
        <span className="text-[#121217]">{value} results</span>
        <ChevronDown className={cn("h-3 w-3 text-[#6C6C89] transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-lg"
          >
            <div className="p-1.5">
              {PER_PAGE_PRESETS.map((preset) => (
                <button key={preset} type="button" onClick={() => { onChange(preset); setOpen(false); }}
                  className={cn("flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                    value === preset ? "bg-[#121217] font-medium text-white" : "text-[#121217] hover:bg-[#F7F7F8]"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="border-t border-[#E4E4E7] p-2">
              <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-[#A9A9BC]">Custom</p>
              <div className="flex gap-1.5">
                <input type="number" min="1" value={customInput} onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCustomSubmit(); } }}
                  placeholder="e.g. 75"
                  className="w-full rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] px-2.5 py-1.5 text-xs text-[#121217] placeholder:text-[#A9A9BC] focus:border-[#121217] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#121217] transition-all duration-200"
                />
                <button type="button" onClick={handleCustomSubmit}
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

// ─── ManualFilters ────────────────────────────────────────────────────────────
export function ManualFilters({ onSubmit, isLoading }: ManualFiltersProps) {
  // Company search
  const [companyQuery, setCompanyQuery] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
  const [titlesPerCompany, setTitlesPerCompany] = useState<Record<string, string[]>>({});
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
      const res = await fetch("/api/apollo/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setCompanySuggestions(data.companies || []);
      setTitlesPerCompany((prev) => ({ ...prev, ...(data.titlesPerCompany || {}) }));
      setShowSuggestions(true);
    } catch {
      setCompanySuggestions([]);
    } finally {
      setCompanyLoading(false);
    }
  };

  const selectCompany = useCallback((company: Company) => {
    setCompanyRows((prev) =>
      prev.find((r) => r.company.id === company.id)
        ? prev
        : [...prev, { company, selectedTitles: [], perPage: "25" }]
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

  const updateRowPerPage = (companyId: string, value: string) => {
    setCompanyRows((prev) =>
      prev.map((r) => (r.company.id === companyId ? { ...r, perPage: value } : r))
    );
  };

  const totalPerPage = companyRows.reduce((sum, r) => sum + (parseInt(r.perPage) || 25), 0);

  const isValid =
    companyRows.length > 0 &&
    companyRows.some((r) => r.selectedTitles.length > 0) &&
    selectedLocations.length > 0;

  // One query string per company — each gets its own per_page and titles
  const buildQueryStrings = (): string[] => {
    return companyRows
      .filter((r) => r.selectedTitles.length > 0)
      .map((r) => {
        const parts: string[] = [];
        if (r.company.domain) {
          parts.push(`q_organization_domains_list[]=${encodeURIComponent(r.company.domain)}`);
        } else {
          parts.push(`q_organization_name=${encodeURIComponent(r.company.name)}`);
        }
        for (const t of r.selectedTitles) {
          parts.push(`person_titles[]=${encodeURIComponent(t)}`);
        }
        for (const l of selectedLocations) {
          parts.push(`person_locations[]=${encodeURIComponent(l)}`);
        }
        parts.push(`per_page=${encodeURIComponent(r.perPage)}`);
        return parts.join("&");
      });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSubmit(buildQueryStrings());
  };

  const handleClear = () => {
    setCompanyRows([]);
    setCompanyQuery("");
    setCompanySuggestions([]);
    setTitlesPerCompany({});
    setSelectedLocations([]);
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
                  <PerPageDropdown
                    value={row.perPage}
                    onChange={(v) => updateRowPerPage(row.company.id, v)}
                  />
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
              <ApolloCombobox
                label="Job Titles"
                placeholder="Select job titles from Apollo..."
                options={titlesPerCompany[row.company.id] || []}
                selected={row.selectedTitles}
                onChange={(titles) => updateRowTitles(row.company.id, titles)}
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
              <ApolloCombobox
                label="Location"
                placeholder="Select UAE locations..."
                options={UAE_LOCATIONS}
                selected={selectedLocations}
                onChange={setSelectedLocations}
                isLoading={false}
              />

              <div className="flex items-end justify-between gap-4 pt-2">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[#6C6C89]">Total results</p>
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-[#F7F7F8] px-3 py-2">
                    <span className="text-sm font-semibold text-[#121217]">{totalPerPage}</span>
                    <span className="text-xs text-[#A9A9BC]">results</span>
                  </div>
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
