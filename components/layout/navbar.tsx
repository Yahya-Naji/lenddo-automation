"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 pt-4 lg:px-10"
    >
      <div className="mx-auto max-w-[1800px]">
        <nav className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-6 py-3 shadow-sm backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#121217]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#121217] tracking-tight">
                Lenddoo
              </span>
              <span className="ml-1.5 text-sm font-medium text-[#6C6C89]">
                Lead Gen
              </span>
            </div>
          </div>

          {/* Center nav items */}
          <div className="hidden items-center gap-1 sm:flex">
            <div className="flex items-center gap-1 rounded-xl bg-[#F7F7F8] p-1">
              <button className="rounded-lg bg-[#121217] px-4 py-1.5 text-xs font-medium text-white shadow-sm">
                Search
              </button>
              <button className="rounded-lg px-4 py-1.5 text-xs font-medium text-[#6C6C89] transition-colors hover:text-[#121217]">
                Results
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#121217] text-[10px] font-bold text-white">
              L
            </div>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
