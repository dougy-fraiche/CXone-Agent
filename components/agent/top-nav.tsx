"use client";

import { useState, useRef, useCallback } from "react";
import { Bell, HelpCircle, Link2, Unlink2, Loader2, Search, LogOut, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAgentStatus,
  STATUS_OPTIONS,
  type StatusCode,
} from "@/lib/agent-status-context";

const AGENT_INITIALS = "DC";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function StatusBubble({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
        isAvailable ? "bg-green-500" : "bg-red-500"
      )}
    >
      {isAvailable
        ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        : <Minus className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
    </span>
  );
}

/* ─── Status dropdown ────────────────────────────────────────────────────── */

function StatusDropdown({
  isAvailable,
  onSelect,
  onGoAvailable,
}: {
  isAvailable: boolean;
  onSelect: (id: StatusCode) => void;
  onGoAvailable: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = STATUS_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-[#D2D8DB] z-[100] overflow-hidden">
      {!isAvailable && (
        <div className="px-3 pt-3 pb-2">
          <Button variant="outline" className="w-full" onClick={onGoAvailable}>
            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </span>
            Go Available
          </Button>
        </div>
      )}

      <div className={cn("px-3 pb-2", isAvailable && "pt-3")}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agent status"
            className="pl-9"
          />
        </div>
      </div>

      <div className="pb-1">
        <p className="px-3 py-1 text-xs text-muted-foreground">
          All Codes ({filtered.length})
        </p>
        {filtered.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors text-left text-sm"
          >
            <StatusBubble isAvailable={opt.isAvailable} />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="border-t border-[#D2D8DB]">
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-foreground hover:bg-muted transition-colors">
          <LogOut className="w-4 h-4 text-muted-foreground" />
          Log Out
        </button>
      </div>
    </div>
  );
}

/* ─── Top Nav ────────────────────────────────────────────────────────────── */

interface TopNavProps {
  className?: string;
}

export function TopNav({ className }: TopNavProps) {
  const { status, setStatus, elapsed }  = useAgentStatus();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [legConnected, setLegConnected]   = useState(false);
  const [legConnecting, setLegConnecting] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAvailable   = status === "available";
  const currentOption = STATUS_OPTIONS.find((o) => o.id === status);

  const handleSelect = useCallback((id: StatusCode) => {
    setStatus(id);
    setDropdownOpen(false);
  }, [setStatus]);

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 120);
  }

  // elapsed is kept in scope for the dropdown's sr-only label
  void elapsed;

  return (
    <header
      className={cn(
        "relative flex items-center justify-between px-4 h-14 shrink-0 z-50 w-full",
        "bg-[#f6f7f9]",
        className
      )}
    >
      {/* Left: App branding */}
      <div className="flex items-center gap-2 shrink-0">
        <AppIcon />
        <span className="text-[#1F2933] font-semibold text-[15px] leading-none px-2 py-1">Agent Workspace</span>
      </div>

      {/* Right: controls */}
      <TooltipProvider delayDuration={400}>
      <div className="flex items-center gap-1 shrink-0">
        {/* Help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 rounded hover:bg-gray-200 text-[#5B6770] transition-colors">
              <HelpCircle className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Open help center in new window</TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="relative p-2 rounded hover:bg-gray-200 text-[#5B6770] transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.75} />
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-semibold text-white leading-none">5</span>
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notifications</TooltipContent>
        </Tooltip>

        {/* Agent Leg */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled={legConnecting}
              onClick={() => {
                if (legConnected) {
                  setLegConnected(false);
                } else {
                  setLegConnecting(true);
                  setTimeout(() => {
                    setLegConnecting(false);
                    setLegConnected(true);
                    toast.success("Agent leg connected");
                  }, 1000);
                }
              }}
              className="p-2 rounded hover:bg-gray-200 text-[#5B6770] transition-colors disabled:pointer-events-none"
            >
              {legConnecting
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : legConnected
                  ? <Link2   className="w-5 h-5" strokeWidth={1.75} />
                  : <Unlink2 className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-center leading-snug">
            {legConnecting ? (
              "Connecting…"
            ) : legConnected ? (
              <><span>Agent leg connected.</span><br /><span>Click to disconnect.</span></>
            ) : (
              <><span>Agent leg disconnected.</span><br /><span>Click to connect.</span></>
            )}
          </TooltipContent>
        </Tooltip>

        {/* ── Agent status trigger + dropdown ── */}
        <div
          className="relative ml-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-2 p-1 rounded-full cursor-pointer select-none hover:bg-gray-200 transition-colors">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#D8DEE3] flex items-center justify-center shrink-0">
                <span className="text-[12px] font-semibold text-[#4A5560] leading-none">
                  {AGENT_INITIALS}
                </span>
              </div>
              <span
                className={cn(
                  "absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white",
                  isAvailable ? "bg-green-500" : "bg-red-500"
                )}
                title={currentOption?.label ?? "Unavailable"}
              >
                <span className="sr-only">{currentOption?.label ?? "Unavailable"} ({formatTime(elapsed)})</span>
              </span>
            </div>
          </div>

          {dropdownOpen && (
            <StatusDropdown
              isAvailable={isAvailable}
              onSelect={handleSelect}
              onGoAvailable={() => handleSelect("available")}
            />
          )}
        </div>
      </div>
      </TooltipProvider>
    </header>
  );
}

/* ─── Static sub-components ─────────────────────────────────────────────── */

function AppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NiCE" role="img">
      <path d="M23.7188 5.81445C23.8757 5.8146 24.0015 5.94038 24 6.0957C23.8494 15.8179 15.9182 23.6985 6.13379 23.8477C5.97839 23.8493 5.85077 23.7237 5.85059 23.5684V19.3086C5.85059 19.1563 5.97502 19.0335 6.12891 19.0303C13.2448 18.8844 19.0048 13.1599 19.1523 6.08984C19.1556 5.93599 19.2788 5.81255 19.4326 5.8125L23.7188 5.81445Z" fill="#3694FC"/>
      <path d="M12.2559 0.000976562C13.8714 0.00104033 15.1804 1.30219 15.1807 2.90625C15.1807 4.51051 13.8716 5.81244 12.2559 5.8125C10.6401 5.8125 9.33008 4.51055 9.33008 2.90625C9.33031 1.30215 10.6402 0.000976562 12.2559 0.000976562Z" fill="#3694FC"/>
      <path d="M2.92578 0C4.5412 0.000213196 5.85033 1.30132 5.85059 2.90527C5.85059 4.50944 4.54135 5.81131 2.92578 5.81152C1.31003 5.81152 0 4.50957 0 2.90527C0.000253194 1.30119 1.31018 0 2.92578 0Z" fill="#3694FC"/>
    </svg>
  );
}
