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
        <span className="text-[#1F2933] font-bold text-[15px] leading-none px-2 py-1">Agent Workspace</span>
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
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.5 37V29.6667H25L32.5 37Z" fill="#E67300"/>
      <path d="M32.5 18.6667H15C13.6193 18.6667 12.5 19.7611 12.5 21.1111V30.8889C12.5 32.2389 13.6193 33.3333 15 33.3333H32.5C33.8807 33.3333 35 32.2389 35 30.8889V21.1111C35 19.7611 33.8807 18.6667 32.5 18.6667Z" fill="#E67300"/>
      <path d="M32.5 17.4444H15C13.6193 17.4444 12.5 18.5389 12.5 19.8889V29.6667C12.5 31.0167 13.6193 32.1111 15 32.1111H32.5C33.8807 32.1111 35 31.0167 35 29.6667V19.8889C35 18.5389 33.8807 17.4444 32.5 17.4444Z" fill="#FF9400"/>
      <path opacity="0.12" d="M35 29.6667V24.6311L27.65 17.4444H15C14.337 17.4444 13.7011 17.702 13.2322 18.1604C12.7634 18.6188 12.5 19.2406 12.5 19.8889V29.6667C12.5 30.315 12.7634 30.9367 13.2322 31.3951C13.7011 31.8536 14.337 32.1111 15 32.1111H32.5C33.163 32.1111 33.7989 31.8536 34.2678 31.3951C34.7366 30.9367 35 30.315 35 29.6667Z" fill="url(#agent_paint0)"/>
      <path d="M7.5 23.5556V16.2222H15L7.5 23.5556Z" fill="#CCCCCC"/>
      <path d="M25 5.22222H7.5C6.11929 5.22222 5 6.31664 5 7.66667V17.4444C5 18.7945 6.11929 19.8889 7.5 19.8889H25C26.3807 19.8889 27.5 18.7945 27.5 17.4444V7.66667C27.5 6.31664 26.3807 5.22222 25 5.22222Z" fill="#CCCCCC"/>
      <path d="M25 4H7.5C6.11929 4 5 5.09441 5 6.44444V16.2222C5 17.5723 6.11929 18.6667 7.5 18.6667H25C26.3807 18.6667 27.5 17.5723 27.5 16.2222V6.44444C27.5 5.09441 26.3807 4 25 4Z" fill="#E6E6E6"/>
      <path opacity="0.04" d="M18.825 23.4822L16.175 26.0733L22.35 32.1111H27.65L18.825 23.4822Z" fill="url(#agent_paint1)"/>
      <path opacity="0.04" d="M25.075 23.4822L22.425 26.0733L28.6 32.1111H32.5C32.8918 32.1121 33.2779 32.0198 33.625 31.8422L25.075 23.4822Z" fill="url(#agent_paint2)"/>
      <path opacity="0.04" d="M31.325 23.4822L28.675 26.0733L34.1875 31.4633C34.4427 31.2351 34.6466 30.9576 34.7865 30.6483C34.9263 30.3391 34.999 30.0048 35 29.6667V27.0756L31.325 23.4822Z" fill="url(#agent_paint3)"/>
      <path d="M17.5 26.6111C18.5355 26.6111 19.375 25.7903 19.375 24.7778C19.375 23.7653 18.5355 22.9444 17.5 22.9444C16.4645 22.9444 15.625 23.7653 15.625 24.7778C15.625 25.7903 16.4645 26.6111 17.5 26.6111Z" fill="white"/>
      <path d="M30 26.6111C31.0355 26.6111 31.875 25.7903 31.875 24.7778C31.875 23.7653 31.0355 22.9444 30 22.9444C28.9645 22.9444 28.125 23.7653 28.125 24.7778C28.125 25.7903 28.9645 26.6111 30 26.6111Z" fill="white"/>
      <path d="M23.75 26.6111C24.7855 26.6111 25.625 25.7903 25.625 24.7778C25.625 23.7653 24.7855 22.9444 23.75 22.9444C22.7145 22.9444 21.875 23.7653 21.875 24.7778C21.875 25.7903 22.7145 26.6111 23.75 26.6111Z" fill="white"/>
      <path opacity="0.08" d="M27.725 18.6667H19.775L13.325 12.36L15.25 6.44444L27.725 18.6667Z" fill="url(#agent_paint4)"/>
      <path d="M18.25 11.5167L17.25 13.2156C16.0411 12.5223 15.034 11.5376 14.325 10.3556L16.0625 9.37778L15.25 6.44444H11.9C11.8158 6.44438 11.7324 6.46096 11.6549 6.49318C11.5774 6.52541 11.5074 6.57263 11.449 6.63199C11.3906 6.69135 11.3451 6.76163 11.3152 6.83862C11.2853 6.91561 11.2716 6.99771 11.275 7.08C11.4277 9.45157 12.4585 11.6876 14.1747 13.3701C15.8909 15.0527 18.1749 16.0665 20.6 16.2222C20.6842 16.2255 20.7681 16.2121 20.8469 16.1829C20.9256 16.1537 20.9975 16.1092 21.0582 16.0521C21.1189 15.995 21.1672 15.9265 21.2001 15.8508C21.2331 15.775 21.2501 15.6935 21.25 15.6111V12.3111L18.25 11.5167Z" fill="#525252"/>
      <defs>
        <linearGradient id="agent_paint0" x1="23.75" y1="17.2733" x2="23.75" y2="31.0233" gradientUnits="userSpaceOnUse">
          <stop/><stop offset="1" stopOpacity="0.25"/>
        </linearGradient>
        <linearGradient id="agent_paint1" x1="17.4625" y1="24.7411" x2="26.077" y2="33.5514" gradientUnits="userSpaceOnUse">
          <stop/><stop offset="1" stopOpacity="0.25"/>
        </linearGradient>
        <linearGradient id="agent_paint2" x1="23.9" y1="24.9244" x2="32.0379" y2="33.2473" gradientUnits="userSpaceOnUse">
          <stop/><stop offset="1" stopOpacity="0.25"/>
        </linearGradient>
        <linearGradient id="agent_paint3" x1="30.0375" y1="24.8144" x2="35.1329" y2="30.0256" gradientUnits="userSpaceOnUse">
          <stop/><stop offset="1" stopOpacity="0.25"/>
        </linearGradient>
        <linearGradient id="agent_paint4" x1="13.475" y1="8.60778" x2="24.9488" y2="20.3423" gradientUnits="userSpaceOnUse">
          <stop/><stop offset="1" stopOpacity="0.25"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
