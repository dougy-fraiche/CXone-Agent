"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  PhoneIncoming,
  Voicemail,
  ClipboardList,
  Hexagon,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Channel data ────────────────────────────────────────────────────────────

type Channel = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
};

const CHANNELS: Channel[] = [
  { id: "digital",       label: "Digital",       icon: Hexagon,       color: "#f59e0b" },
  { id: "inbound-voice", label: "Inbound Voice",  icon: PhoneIncoming, color: "#7c3aed" },
  { id: "voicemail",     label: "Voicemail",      icon: Voicemail,     color: "#ef4444" },
  { id: "work-item",     label: "Work Item",      icon: ClipboardList, color: "#3b82f6" },
];

// ─── List view ───────────────────────────────────────────────────────────────

function QueueList({ onSelect }: { onSelect: (ch: Channel) => void }) {
  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-2 border-b border-[#D2D8DB] bg-[#F5F8FA] shrink-0">
        <span className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide">Channel</span>
        <span className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide w-32 text-left">Contacts in Queue</span>
        <span className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide w-16 text-left">Wait</span>
        <span className="w-6" />
      </div>

      {/* Rows */}
      {CHANNELS.map((ch) => {
        const Icon = ch.icon;
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(ch)}
            className={cn(
              "grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 border-b border-[#D2D8DB] w-full text-left",
              "hover:bg-[#F5F8FA] transition-colors group"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" style={{ color: ch.color }} />
              <span className="text-[13px] text-[#333] truncate">{ch.label}</span>
            </div>
            <span className="text-[13px] text-[#333] w-32 text-left">0</span>
            <span className="text-[13px] text-[#333] w-16 text-left">0s</span>
            <ChevronRight className="w-4 h-4 text-[#526b7a] shrink-0 group-hover:text-[#333] transition-colors" />
          </button>
        );
      })}
    </div>
  );
}

// ─── Detail view ─────────────────────────────────────────────────────────────

function QueueDetail({ channel, onBack }: { channel: Channel; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back header */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#F5F8FA] border-b border-[#D2D8DB] shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] text-[#005C99] hover:text-[#003D7A] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{channel.label}</span>
        </button>
      </div>

      {/* Stat counters */}
      <div className="flex items-center justify-center gap-6 px-4 py-4 shrink-0">
        <div className="flex flex-col items-center border border-[#D2D8DB] rounded px-8 py-2 bg-white min-w-[100px]">
          <span className="text-[10px] font-semibold text-[#526b7a] uppercase tracking-wide mb-1">Skills</span>
          <span className="text-[18px] font-semibold text-[#005C99]">0</span>
        </div>
        <div className="flex flex-col items-center border border-[#D2D8DB] rounded px-8 py-2 bg-white min-w-[100px]">
          <span className="text-[10px] font-semibold text-[#526b7a] uppercase tracking-wide mb-1">Contacts</span>
          <span className="text-[18px] font-semibold text-[#005C99]">0</span>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-4 items-center px-4 py-2 border-b border-[#D2D8DB] bg-[#F5F8FA] shrink-0">
        <span className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide">Skill Name</span>
        <span className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide">In Queue</span>
        <span className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide">Longest Wait</span>
        <span className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide">Agent States</span>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
        <Inbox className="w-10 h-10 text-[#C3C5C9]" />
        <span className="text-[13px] text-[#526b7a]">No Skills Assigned</span>
      </div>
    </div>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────

export function QueuePanel({ className }: { className?: string }) {
  const [selected, setSelected] = useState<Channel | null>(null);

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {selected ? (
        <QueueDetail channel={selected} onBack={() => setSelected(null)} />
      ) : (
        <QueueList onSelect={setSelected} />
      )}
    </div>
  );
}
