"use client";

import { useState } from "react";
import {
  ChartColumnBig,
  CircleCheck,
  Circle,
  MinusCircle,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col h-full bg-white border border-[#D2D8DB] rounded-lg shadow-sm overflow-hidden";

type ReportingTab = "productivity" | "performance";
type TimePeriod = "today" | "yesterday" | "last7" | "custom";

const REPORT_TABS: { id: ReportingTab; label: string }[] = [
  { id: "productivity", label: "Productivity" },
  { id: "performance",  label: "Performance" },
];

const PERIODS: { id: TimePeriod; label: string }[] = [
  { id: "today",     label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7",     label: "Last 7 days" },
  { id: "custom",    label: "Custom" },
];

function TimePeriodSelector({
  period,
  onChange,
}: {
  period: TimePeriod;
  onChange: (p: TimePeriod) => void;
}) {
  return (
    <div className="flex border border-[#D2D8DB] rounded overflow-hidden shrink-0">
      {PERIODS.map((p) => {
        const isActive = period === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={cn(
              "px-3 py-1.5 text-[12px] transition-colors border-r border-[#D2D8DB] last:border-r-0",
              isActive
                ? "bg-[#ECF3F8] text-[#005C99] font-medium"
                : "text-[#526b7a] hover:bg-[#F5F8FA]"
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

function ProductivityTab({ period, onPeriodChange }: { period: TimePeriod; onPeriodChange: (p: TimePeriod) => void }) {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-[14px] font-semibold text-[#333]">Productivity (0%)</span>
        <TimePeriodSelector period={period} onChange={onPeriodChange} />
      </div>

      {/* Table header */}
      <div className="flex items-center px-4 py-2 bg-[#ECF3F8] border-y border-[#D2D8DB] shrink-0">
        <span className="flex-1 text-[12px] text-[#526b7a]">Agent states</span>
        <span className="w-24 text-[12px] text-[#526b7a]">Time</span>
      </div>

      {/* Available */}
      <div className="flex items-center px-4 py-3 border-b border-[#D2D8DB]">
        <div className="flex items-center gap-2 w-48 shrink-0">
          <CircleCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
          <span className="text-[13px] font-semibold text-[#333]">Available (0%)</span>
        </div>
        <div className="flex-1 flex items-center gap-2 mx-4">
          <div className="flex-1 h-5 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#22c55e]" />
          </div>
        </div>
        <span className="w-20 text-[13px] font-semibold text-[#333] shrink-0">00:00:00</span>
      </div>
      {/* Available — Team sub-row */}
      <div className="flex items-center px-4 py-2 border-b border-[#D2D8DB] bg-[#fafafa]">
        <div className="flex items-center gap-2 w-48 shrink-0 pl-6">
          <span className="text-[12px] text-[#526b7a]">Team (0%)</span>
        </div>
        <div className="flex-1 flex items-center gap-2 mx-4">
          <div className="flex-1 h-4 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-[#86efac]" />
          </div>
        </div>
        <span className="w-20 text-[12px] text-[#526b7a] shrink-0">00:00:00</span>
      </div>

      {/* Working */}
      <div className="flex items-center px-4 py-3 border-b border-[#D2D8DB]">
        <div className="flex items-center gap-2 w-48 shrink-0">
          <Circle className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b] shrink-0" />
          <span className="text-[13px] font-semibold text-[#333]">Working (0%)</span>
        </div>
        <div className="flex-1 flex items-center gap-2 mx-4">
          <div className="flex-1 h-5 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#f59e0b]" />
          </div>
        </div>
        <span className="w-20 text-[13px] font-semibold text-[#333] shrink-0">00:00:00</span>
      </div>
      {/* Working — Team sub-row */}
      <div className="flex items-center px-4 py-2 border-b border-[#D2D8DB] bg-[#fafafa]">
        <div className="flex items-center gap-2 w-48 shrink-0 pl-6">
          <span className="text-[12px] text-[#526b7a]">Team (0%)</span>
        </div>
        <div className="flex-1 flex items-center gap-2 mx-4">
          <div className="flex-1 h-4 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-[#fcd34d]" />
          </div>
        </div>
        <span className="w-20 text-[12px] text-[#526b7a] shrink-0">00:00:00</span>
      </div>

      {/* Unavailable */}
      <div className="flex items-center px-4 py-3 border-b border-[#D2D8DB]">
        <div className="flex items-center gap-2 w-48 shrink-0">
          <MinusCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
          <span className="text-[13px] font-semibold text-[#333]">Unavailable (100%)</span>
        </div>
        <div className="flex-1 flex items-center gap-2 mx-4">
          <div className="flex-1 h-5 bg-[#ef4444] rounded-sm" />
        </div>
        <span className="w-20 text-[13px] font-semibold text-[#333] shrink-0">00:00:00</span>
      </div>
      {/* Unavailable — Unavailable sub-row */}
      <div className="flex items-center px-4 py-2 border-b border-[#D2D8DB] bg-[#fafafa]">
        <div className="flex items-center gap-2 w-48 shrink-0 pl-6">
          <span className="text-[12px] text-[#526b7a]">Unavailable</span>
        </div>
        <div className="flex-1 flex items-center gap-2 mx-4">
          <div className="flex-1 h-4 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-[#fca5a5]" />
          </div>
        </div>
        <span className="w-20 text-[12px] text-[#526b7a] shrink-0">00:00:00</span>
      </div>
      {/* Unavailable — Team sub-row */}
      <div className="flex items-center px-4 py-2 border-b border-[#D2D8DB] bg-[#fafafa]">
        <div className="flex items-center gap-2 w-48 shrink-0 pl-6">
          <span className="text-[12px] text-[#526b7a]">Team (100%)</span>
        </div>
        <div className="flex-1 flex items-center gap-2 mx-4">
          <div className="flex-1 h-4 bg-[#fca5a5] rounded-sm" />
        </div>
        <span className="w-20 text-[12px] text-[#526b7a] shrink-0">00:00:00</span>
      </div>
    </div>
  );
}

function PerformanceTab({ period, onPeriodChange }: { period: TimePeriod; onPeriodChange: (p: TimePeriod) => void }) {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-[14px] font-semibold text-[#333]">Performance (0%)</span>
        <TimePeriodSelector period={period} onChange={onPeriodChange} />
      </div>

      {/* Table */}
      <div className="mx-4 border border-[#D2D8DB] rounded overflow-hidden shrink-0">
        {/* Table header */}
        <div className="grid grid-cols-4 border-b border-[#D2D8DB] bg-white">
          <div className="px-4 py-3 text-[12px] text-[#526b7a]">Channel Type</div>
          <div className="px-4 py-3 text-[12px] text-[#526b7a] text-center">You</div>
          <div className="px-4 py-3 text-[12px] text-[#526b7a] text-center">Team</div>
          <div className="px-4 py-3 text-[12px] text-[#526b7a] text-center">% of Team</div>
        </div>

        {/* Inbound */}
        <div className="grid grid-cols-4 border-b border-[#D2D8DB]">
          <div className="px-4 py-3 flex items-center gap-2">
            <PhoneIncoming className="w-4 h-4 text-[#526b7a] shrink-0" />
            <span className="text-[13px] text-[#333]">Inbound</span>
          </div>
          <div className="px-4 py-3 text-[13px] text-[#333] text-center">0</div>
          <div className="px-4 py-3 text-[13px] text-[#333] text-center">0</div>
          <div className="px-4 py-3 text-[13px] text-[#333] text-center">0%</div>
        </div>

        {/* Outbound */}
        <div className="grid grid-cols-4 border-b border-[#D2D8DB]">
          <div className="px-4 py-3 flex items-center gap-2">
            <PhoneOutgoing className="w-4 h-4 text-[#526b7a] shrink-0" />
            <span className="text-[13px] text-[#333]">Outbound</span>
          </div>
          <div className="px-4 py-3 text-[13px] text-[#333] text-center">0</div>
          <div className="px-4 py-3 text-[13px] text-[#333] text-center">0</div>
          <div className="px-4 py-3 text-[13px] text-[#333] text-center">0%</div>
        </div>

        {/* Overall */}
        <div className="grid grid-cols-4 border-t-2 border-[#D2D8DB]">
          <div className="px-4 py-3">
            <span className="text-[13px] font-semibold text-[#333]">Overall</span>
          </div>
          <div className="px-4 py-3 text-[13px] font-semibold text-[#333] text-center">0</div>
          <div className="px-4 py-3 text-[13px] font-semibold text-[#333] text-center">0</div>
          <div className="px-4 py-3 text-[13px] font-semibold text-[#333] text-center">0%</div>
        </div>
      </div>
    </div>
  );
}

export function ReportingPage({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<ReportingTab>("productivity");
  const [period, setPeriod] = useState<TimePeriod>("today");

  return (
    <div className={cn(CARD, className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#D2D8DB] shrink-0">
        <ChartColumnBig className="w-4 h-4 text-[#005C99]" />
        <span className="text-[15px] font-semibold text-[#333]">Reporting</span>
      </div>

      {/* Tab bar */}
      <div className="flex items-end px-4 border-b border-[#D2D8DB] shrink-0">
        {REPORT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "text-[#005C99]"
                  : "text-[#526b7a] hover:text-[#333]"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#005C99] rounded-t-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "productivity" ? (
        <ProductivityTab period={period} onPeriodChange={setPeriod} />
      ) : (
        <PerformanceTab period={period} onPeriodChange={setPeriod} />
      )}
    </div>
  );
}
