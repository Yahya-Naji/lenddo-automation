"use client";

import { motion } from "framer-motion";
import { Plane, Banknote, Building } from "lucide-react";
import { QUICK_FILTERS } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  plane: Plane,
  banknote: Banknote,
  building: Building,
};

interface QuickFiltersProps {
  onSelect: (query: string) => void;
}

export function QuickFilters({ onSelect }: QuickFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#A9A9BC]">
        Quick Searches
      </h3>
      <div className="flex flex-col gap-2">
        {QUICK_FILTERS.map((filter, i) => {
          const Icon = ICONS[filter.icon];
          return (
            <motion.button
              key={filter.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
              onClick={() => onSelect(filter.query)}
              className="group flex items-center gap-3 rounded-xl p-3 text-start transition-all duration-200 hover:bg-[#F7F7F8] active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F7F8] transition-colors duration-200 group-hover:bg-[#121217]">
                <Icon className="h-4 w-4 text-[#6C6C89] transition-colors duration-200 group-hover:text-white" />
              </div>
              <span className="text-xs font-medium leading-tight text-[#121217]">
                {filter.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
