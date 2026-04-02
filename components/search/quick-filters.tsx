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
    <div className="mt-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#A9A9BC]">
        Quick Searches
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_FILTERS.map((filter, i) => {
          const Icon = ICONS[filter.icon];
          return (
            <motion.button
              key={filter.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              onClick={() => onSelect(filter.query)}
              className="group flex items-center gap-3 rounded-2xl bg-white p-4 text-start shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F7F8] transition-colors group-hover:bg-[#121217]">
                <Icon className="h-4 w-4 text-[#6C6C89] transition-colors group-hover:text-white" />
              </div>
              <span className="text-xs font-medium leading-tight text-[#121217]">
                {filter.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
