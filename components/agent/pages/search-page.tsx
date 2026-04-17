"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { format, parse, isValid } from "date-fns";
import {
  Search,
  X,
  ListFilter,
  Columns3,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button, buttonVariants } from "@/components/ui/button";

const CARD = "flex flex-col h-full bg-white border border-[#D2D8DB] rounded-lg shadow-sm overflow-hidden";

type SearchTab = "interactions" | "messages" | "customers" | "threads";

const TABS: { id: SearchTab; label: string }[] = [
  { id: "interactions", label: "Interactions" },
  { id: "messages",     label: "Messages" },
  { id: "customers",    label: "Customers" },
  { id: "threads",      label: "Threads" },
];

const COLUMNS = ["TYPE", "CREATE DATE", "STATUS", "CHANNEL", "SKILL"];

const SUGGESTIONS = [
  "ownerAssignee IS",
  "inboxAssignee IS",
  "ownerAssignee=",
  "inboxAssignee=",
  "caseId=",
  "threadId=",
  "threadIdOnExternalPlatform=",
  "content=",
  "title=",
  "status=",
  "author=",
  "customField[ident]=",
  "customField[ident] !=",
  "customField[ident] IN",
  "customField[ident] NOT IN",
  "customField[ident] < NUMBER",
  "customField[ident] > NUMBER",
  "AND",
  "OR",
  "inboxAssigneeAgentId=",
  "inboxAssigneeAgentId IS",
  "ownerAssigneeAgentId=",
  "ownerAssigneeAgentId IS",
  "skillId=",
  "skillId IS",
  "skillId IN",
  "skillId NOT IN",
];

/* ─── Date Picker Input ──────────────────────────────────────────────────── */
function DatePickerInput({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}) {
  const [text, setText] = useState(() =>
    value ? format(value, "MM/dd/yyyy") : ""
  );
  const [calOpen, setCalOpen] = useState(false);

  // Sync input text when value is cleared externally (e.g. Clear button)
  useEffect(() => {
    if (!value) setText("");
  }, [value]);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setText(raw);
    if (raw === "") { onChange(undefined); return; }
    // Only attempt parse once the full 10-char date is typed
    if (raw.length === 10) {
      const parsed = parse(raw, "MM/dd/yyyy", new Date());
      if (isValid(parsed)) onChange(parsed);
    }
  }

  function handleCalSelect(date: Date | undefined) {
    onChange(date);
    setText(date ? format(date, "MM/dd/yyyy") : "");
    setCalOpen(false);
  }

  return (
    <div className="flex items-center h-9 rounded-md border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        placeholder="MM/DD/YYYY"
        maxLength={10}
        className="flex-1 h-full min-w-0 rounded-l-md px-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
      />

      {/* Divider */}
      <div className="w-px h-5 bg-border shrink-0" />

      {/* Calendar icon trigger */}
      <Popover open={calOpen} onOpenChange={setCalOpen}>
        <PopoverTrigger className="flex h-full w-9 shrink-0 items-center justify-center rounded-r-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <CalendarIcon className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar mode="single" selected={value} onSelect={handleCalSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ─── Multi-select Combobox ──────────────────────────────────────────────── */
interface ComboboxOption { label: string; value: string }

interface MultiComboboxProps {
  options: ComboboxOption[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  placeholder?: string;
}

function MultiCombobox({ options, selected, onSelectedChange, placeholder = "Select…" }: MultiComboboxProps) {
  const [open, setOpen] = useState(false);

  function toggle(value: string) {
    onSelectedChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex flex-wrap items-center gap-1 min-h-9 w-full rounded-md border bg-background px-2.5 py-1.5 text-sm cursor-pointer transition-colors text-left",
            open
              ? "border-ring ring-1 ring-ring outline-none"
              : "border-input hover:border-ring/50"
          )}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground flex-1">{placeholder}</span>
          ) : (
            selected.map((val) => {
              const label = options.find((o) => o.value === val)?.label ?? val;
              return (
                <span
                  key={val}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium rounded px-1.5 py-0.5 shrink-0"
                >
                  {label}
                  <span
                    role="button"
                    onPointerDown={(e) => { e.stopPropagation(); toggle(val); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              );
            })
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => toggle(opt.value)}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors mr-2",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    )}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    {opt.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Filter Panel ───────────────────────────────────────────────────────── */
const FIELD_LABEL = "text-[11px] font-bold tracking-wide text-[#333] uppercase mb-1.5";

const FILTER_OPTIONS = {
  channel:       [{ value: "webchat", label: "Webchat" }, { value: "phone", label: "Phone" }, { value: "email", label: "Email" }, { value: "facebook", label: "Facebook" }, { value: "sms", label: "SMS" }, { value: "twitter", label: "Twitter" }],
  status:        [{ value: "open", label: "Open" }, { value: "pending", label: "Pending" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }],
  skill:         [{ value: "customer-support", label: "Customer Support" }, { value: "sales-support", label: "Sales Support" }, { value: "technical-support", label: "Technical Support" }, { value: "billing", label: "Billing" }],
  inboxAssignee: [{ value: "agent-smith", label: "Agent Smith" }, { value: "agent-jones", label: "Agent Jones" }, { value: "unassigned", label: "Unassigned" }],
  ownerAssignee: [{ value: "agent-smith", label: "Agent Smith" }, { value: "agent-jones", label: "Agent Jones" }, { value: "unassigned", label: "Unassigned" }],
  tag:           [{ value: "fraud", label: "Fraud" }, { value: "billing", label: "Billing" }, { value: "technical", label: "Technical" }, { value: "escalated", label: "Escalated" }, { value: "vip", label: "VIP" }],
};

function FilterPanel() {
  const [channel, setChannel] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [skill, setSkill] = useState<string[]>([]);
  const [inboxAssignee, setInboxAssignee] = useState<string[]>([]);
  const [ownerAssignee, setOwnerAssignee] = useState<string[]>([]);
  const [tag, setTag] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);

  function handleClear() {
    setChannel([]); setStatus([]); setSkill([]);
    setInboxAssignee([]); setOwnerAssignee([]); setTag([]);
    setStartDate(undefined); setEndDate(undefined);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter className="w-4 h-4" />
          Filters
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" sideOffset={6} className="w-80 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D2D8DB]">
          <span className="text-[14px] font-semibold text-[#005C99]">Filter Options</span>
          <button onClick={() => setOpen(false)} className="text-[#526b7a] hover:text-[#333] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex flex-col gap-4 px-4 py-4 overflow-y-auto max-h-[70vh]">
          <div>
            <p className={FIELD_LABEL}>Channel</p>
            <MultiCombobox options={FILTER_OPTIONS.channel} selected={channel} onSelectedChange={setChannel} />
          </div>
          <div>
            <p className={FIELD_LABEL}>Status</p>
            <MultiCombobox options={FILTER_OPTIONS.status} selected={status} onSelectedChange={setStatus} />
          </div>
          <div>
            <p className={FIELD_LABEL}>Skill</p>
            <MultiCombobox options={FILTER_OPTIONS.skill} selected={skill} onSelectedChange={setSkill} />
          </div>
          <div>
            <p className={FIELD_LABEL}>Inbox Assignee</p>
            <MultiCombobox options={FILTER_OPTIONS.inboxAssignee} selected={inboxAssignee} onSelectedChange={setInboxAssignee} />
          </div>
          <div>
            <p className={FIELD_LABEL}>Owner Assignee</p>
            <MultiCombobox options={FILTER_OPTIONS.ownerAssignee} selected={ownerAssignee} onSelectedChange={setOwnerAssignee} />
          </div>
          <div>
            <p className={FIELD_LABEL}>Tag</p>
            <MultiCombobox options={FILTER_OPTIONS.tag} selected={tag} onSelectedChange={setTag} />
          </div>

          {/* Create Date Range */}
          <div>
            <p className={FIELD_LABEL}>Create Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[12px] text-[#526b7a] mb-1">Start Date</p>
                <DatePickerInput value={startDate} onChange={setStartDate} />
              </div>
              <div>
                <p className="text-[12px] text-[#526b7a] mb-1">End Date</p>
                <DatePickerInput value={endDate} onChange={setEndDate} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#D2D8DB]">
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <Button onClick={() => setOpen(false)}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Query Builder ──────────────────────────────────────────────────────── */
interface QueryBuilderProps {
  chips: string[];
  onChipsChange: (chips: string[]) => void;
}

function QueryBuilder({ chips, onChipsChange }: QueryBuilderProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = inputValue.trim()
    ? SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase())
      )
    : SUGGESTIONS;

  // Reset highlight when filtered list changes
  useEffect(() => { setHighlightedIdx(0); }, [inputValue]);

  // Close on click-outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const addChip = useCallback((value: string) => {
    if (!chips.includes(value)) onChipsChange([...chips, value]);
    setInputValue("");
    // Keep dropdown open so user can continue filtering/selecting
    inputRef.current?.focus();
  }, [chips, onChipsChange]);

  const removeChip = useCallback((chip: string) => {
    onChipsChange(chips.filter((c) => c !== chip));
  }, [chips, onChipsChange]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && filtered[highlightedIdx]) {
      e.preventDefault();
      addChip(filtered[highlightedIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && inputValue === "" && chips.length > 0) {
      onChipsChange(chips.slice(0, -1));
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Input field with chips */}
      <div
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
        className={cn(
          "flex items-center flex-wrap gap-1.5 min-h-[34px] px-2.5 py-1.5 rounded border bg-white cursor-text transition-colors",
          open
            ? "border-[#005C99] ring-2 ring-[#005C99]/15"
            : "border-[#D2D8DB] hover:border-[#B0BDCA]"
        )}
      >
        {/* Chips */}
        {chips.map((chip) => (
          <span
            key={chip}
            className="flex items-center gap-1 bg-[#E8F2FA] text-[#005C99] border border-[#AACDE8] text-[12px] font-medium rounded px-2 py-0.5 shrink-0"
          >
            {chip}
            <button
              onPointerDown={(e) => { e.stopPropagation(); removeChip(chip); }}
              className="text-[#5B9EC9] hover:text-[#003D7A] transition-colors"
              tabIndex={-1}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={chips.length === 0 ? "Search…" : ""}
          className="flex-1 min-w-[80px] text-[13px] text-[#333] placeholder:text-[#9AABB5] bg-transparent outline-none"
        />

        {/* Clear button */}
        {(chips.length > 0 || inputValue) && (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onChipsChange([]);
              setInputValue("");
              inputRef.current?.focus();
            }}
            className="shrink-0 ml-1 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            title="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown — always visible while field is focused */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D2D8DB] rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-[#9AABB5]">No matching suggestions</p>
          ) : (
            filtered.map((suggestion, idx) => (
              <button
                key={suggestion}
                onPointerDown={(e) => { e.preventDefault(); addChip(suggestion); }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-[13px] text-[#333] transition-colors",
                  idx === highlightedIdx
                    ? "bg-[#EAF3FB] text-[#005C99]"
                    : "hover:bg-[#F5F8FA]"
                )}
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Search Page ─────────────────────────────────────────────────────────── */
export function SearchPage({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<SearchTab>("interactions");
  const [chips, setChips] = useState<string[]>(["ownerAssignee IS"]);

  return (
    <div className={cn(CARD, className)}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
        <Search className="w-4 h-4 text-[#005C99] shrink-0" />
        <span className="text-[15px] font-semibold text-[#333]">Search</span>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────── */}
      <div className="flex items-end gap-0 px-4 border-b border-[#D2D8DB] shrink-0">
        {TABS.map((tab) => {
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

      {/* ── Filter / query-builder row ────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#D2D8DB] shrink-0 bg-[#F5F8FA]">
        <QueryBuilder chips={chips} onChipsChange={setChips} />

        {/* Filters panel */}
        <FilterPanel />

        {/* Columns button */}
        <Button variant="outline">
          <Columns3 className="w-4 h-4" />
          Columns
        </Button>
      </div>

      {/* ── Action row ───────────────────────────────────────────── */}
      <div className="flex items-center gap-0 px-4 py-1.5 border-b border-[#D2D8DB] shrink-0">
        <button className="flex items-center gap-1.5 text-[12px] text-[#005C99] hover:text-[#003D7A] transition-colors px-2 py-1 rounded hover:bg-[#ECF3F8]">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        <button
          onClick={() => setChips([])}
          className="flex items-center gap-1.5 text-[12px] text-[#005C99] hover:text-[#003D7A] transition-colors px-2 py-1 rounded hover:bg-[#ECF3F8]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* ── Table header ─────────────────────────────────────────── */}
      <div className="flex items-center border-b border-[#D2D8DB] bg-white shrink-0 px-4">
        <div className="w-8 shrink-0 py-2.5">
          <input type="checkbox" className="w-3.5 h-3.5 accent-[#005C99]" />
        </div>
        {COLUMNS.map((col) => (
          <div
            key={col}
            className={cn(
              "py-2.5 text-[11px] font-semibold text-[#526b7a] uppercase tracking-wide flex items-center gap-1 select-none",
              col === "SKILL" ? "flex-1" : "w-32 shrink-0"
            )}
          >
            {col}
            {col === "CREATE DATE" && <ChevronDown className="w-3 h-3" />}
          </div>
        ))}
      </div>

      {/* ── Table body / empty state ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-[#526b7a]">No results found</p>
      </div>

      {/* ── Pagination footer ─────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-[#D2D8DB] shrink-0">
        <span className="text-[12px] text-[#526b7a]">0–0 of 0</span>
        <button disabled className="p-1 rounded text-[#526b7a] disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button disabled className="p-1 rounded text-[#526b7a] disabled:opacity-40">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
