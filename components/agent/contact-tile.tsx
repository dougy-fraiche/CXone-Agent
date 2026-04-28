
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  Facebook,
  Twitter,
  MessageSquare,
  ArrowUpRight,
  CheckCircle,
  ArrowRightLeft,
  // Phone call controls
  CirclePause,
  Mic,
  MicOff,
  EyeOff,
  Eye,
  CircleDot,
  PhoneForwarded,
  Grid3x3,
  PhoneOff,
  CircleCheckBig,
  ChevronLeft,
  ChevronDown,
  Delete,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact, Channel } from "@/lib/mock-data";
import {
  Sheet,
  SheetContent,
  SheetPortal,
  SheetOverlay,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ContactTileProps {
  contact: Contact;
  isActive: boolean;
  onClick: () => void;
  onTransfer?: () => void;
}

/* ─── Channel icon ───────────────────────────────────────────────────────── */

export function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  const icons: Record<Channel, React.ElementType> = {
    webchat: MessageCircle,
    phone: Phone,
    email: Mail,
    facebook: Facebook,
    twitter: Twitter,
    sms: MessageSquare,
    whatsapp: MessageCircle,
  };
  const Icon = icons[channel];
  const colors: Record<Channel, string> = {
    webchat: "text-[#005C99]",
    phone: "text-green-600",
    email: "text-pink-600",
    facebook: "text-blue-600",
    twitter: "text-sky-500",
    sms: "text-purple-600",
    whatsapp: "text-[#25D366]",
  };
  return <Icon className={cn("w-4 h-4", colors[channel], className)} />;
}

/* ─── Outcome sheet ──────────────────────────────────────────────────────── */

const TAGS = [
  "Resolved",
  "Follow-up Required",
  "Escalated",
  "Billing Issue",
  "Technical Issue",
  "General Inquiry",
  "Wrong Number",
  "No Answer",
];

function OutcomeSheet({
  open,
  onClose,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  contact: Contact;
}) {
  const [tag, setTag] = useState<string>("");
  const [notes, setNotes] = useState("");

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    onClose();
  }

  // Channel icon colors for the sheet header
  const channelIconColor: Record<Channel, string> = {
    webchat: "text-[#005C99]",
    phone: "text-violet-600",
    email: "text-pink-600",
    facebook: "text-blue-600",
    twitter: "text-sky-500",
    sms: "text-purple-600",
    whatsapp: "text-[#25D366]",
  };
  const ChannelIconLg = (() => {
    const icons: Record<Channel, React.ElementType> = {
      webchat: MessageCircle,
      phone: Phone,
      email: Mail,
      facebook: Facebook,
      twitter: Twitter,
      sms: MessageSquare,
      whatsapp: MessageCircle,
    };
    return icons[contact.channel];
  })();

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetPortal>
        <SheetOverlay className="bg-black/20" />
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-2xl border-t border-[#D2D8DB] shadow-xl flex flex-col"
          style={{ height: "88vh", maxHeight: "88vh" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#EBEBEB] shrink-0">
            <div className="flex items-center gap-3">
              <ChannelIconLg className={cn("w-6 h-6", channelIconColor[contact.channel])} />
              <div>
                <h2 className="text-[17px] font-bold text-[#191919] leading-tight">Outcome</h2>
                <p className="text-[13px] text-[#526b7a] leading-snug mt-0.5">{contact.queue}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1 rounded-full hover:bg-[#ECF3F8] transition-colors text-[#526b7a] mt-0.5"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 min-h-0">
            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                Tags
              </label>
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a tag…" />
                </SelectTrigger>
                <SelectContent>
                  {TAGS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5 flex-1 min-h-0">
              <label className="text-[11px] font-semibold text-[#526b7a] uppercase tracking-wider">
                Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add call notes…"
                className="flex-1 min-h-[160px] resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-[#EBEBEB] shrink-0">
            <Button
              onClick={handleSave}
              className="bg-[#005C99] hover:bg-[#003D7A] text-white px-6"
            >
              Save &amp; Close
            </Button>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}

/* ─── Keypad keys ────────────────────────────────────────────────────────── */

const KEYS: { digit: string; sub: string }[] = [
  { digit: "1", sub: "" },
  { digit: "2", sub: "ABC" },
  { digit: "3", sub: "DEF" },
  { digit: "4", sub: "GHI" },
  { digit: "5", sub: "JKL" },
  { digit: "6", sub: "MNO" },
  { digit: "7", sub: "PQRS" },
  { digit: "8", sub: "TUV" },
  { digit: "9", sub: "WXYZ" },
  { digit: "*", sub: "" },
  { digit: "0", sub: "+" },
  { digit: "#", sub: "" },
];

/* ─── Phone call controls panel ─────────────────────────────────────────── */

interface PhoneCallControlsProps {
  contact: Contact;
  isMuted: boolean;
  onMuteToggle: () => void;
  onTransfer?: () => void;
}

function PhoneCallControls({ contact, isMuted, onMuteToggle, onTransfer }: PhoneCallControlsProps) {
  const [isHeld, setIsHeld] = useState(false);
  const [isMasked, setIsMasked] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [dialNumber, setDialNumber] = useState("");
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showKeypad) inputRef.current?.focus();
  }, [showKeypad]);

  function handleKeyPress(digit: string) {
    setDialNumber((prev) => prev + digit);
  }

  function handleBackspace() {
    setDialNumber((prev) => prev.slice(0, -1));
  }

  /* ── Keypad view ── */
  if (showKeypad) {
    return (
      <div className="mx-2 mb-2 bg-white rounded shadow-sm border border-[#D2D8DB] overflow-hidden">
        {/* Number input row */}
        <div className="flex items-center gap-1 px-2 pt-2.5 pb-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowKeypad(false); setDialNumber(""); }}
            className="p-1 rounded hover:bg-[#ECF3F8] transition-colors shrink-0"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4 text-[#526b7a]" />
          </button>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter number"
              className="w-full border border-[#D2D8DB] rounded px-2.5 py-1 text-[13px] text-[#333] placeholder:text-[#B0BEC5] outline-none focus:border-[#005C99] text-center"
            />
            {dialNumber && (
              <button
                onClick={(e) => { e.stopPropagation(); handleBackspace(); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#B0BEC5] hover:text-[#526b7a] transition-colors"
                title="Backspace"
              >
                <Delete className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Key grid 3×4 */}
        <div className="grid grid-cols-3">
          {KEYS.map(({ digit, sub }) => (
            <button
              key={digit}
              onClick={(e) => { e.stopPropagation(); handleKeyPress(digit); }}
              className="flex flex-col items-center justify-center py-2 hover:bg-[#ECF3F8] transition-colors"
            >
              <span className="text-[15px] font-medium text-[#333] leading-tight">{digit}</span>
              {sub && <span className="text-[8px] text-[#8fa3b1] font-semibold tracking-widest leading-none mt-0.5">{sub}</span>}
            </button>
          ))}
        </div>

        {/* Mute at bottom */}
        <div className="h-px bg-[#D2D8DB]" />
        <div className="flex justify-center py-2.5">
          <button
            onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
            title={isMuted ? "Unmute" : "Mute"}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-1 rounded transition-colors",
              isMuted ? "text-white bg-[#005C99]" : "text-[#526b7a] hover:bg-[#ECF3F8]"
            )}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  /* ── Normal controls view ── */
  const controlButtons: {
    icon: React.ElementType;
    title: string;
    toggled?: boolean;
    onToggle?: () => void;
    onClick?: () => void;
  }[] = [
    { icon: CirclePause,    title: isHeld ? "Resume" : "Hold",   toggled: isHeld,   onToggle: () => setIsHeld((v) => !v) },
    { icon: isMuted ? MicOff : Mic, title: isMuted ? "Unmute" : "Mute", toggled: isMuted, onToggle: onMuteToggle },
    { icon: isMasked ? EyeOff : Eye, title: isMasked ? "Unmask" : "Mask", toggled: isMasked, onToggle: () => setIsMasked((v) => !v) },
    { icon: CircleDot,      title: "Record" },
    { icon: PhoneForwarded, title: "Transfer", onClick: onTransfer },
    { icon: Grid3x3,        title: "Keypad",   onClick: () => setShowKeypad(true) },
  ];

  return (
    <>
      <div className="mx-2 mb-2 bg-white rounded shadow-sm border border-[#D2D8DB] overflow-hidden">
        {/* 3 × 2 icon grid */}
        <div className="grid grid-cols-3">
          {controlButtons.map(({ icon: Icon, title, toggled, onToggle, onClick }) => (
            <button
              key={title}
              title={title}
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.();
                onClick?.();
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                toggled ? "bg-[#005C99] hover:bg-[#003D7A]" : "hover:bg-[#ECF3F8]"
              )}
            >
              <Icon className={cn("w-4 h-4", toggled ? "text-white" : "text-[#005C99]")} />
              <span className={cn("text-[9px] leading-none", toggled ? "text-white" : "text-[#526b7a]")}>
                {title}
              </span>
            </button>
          ))}
        </div>

        {/* Bottom bar: hang up | outcome */}
        <div className="h-px bg-[#D2D8DB]" />
        <div className="flex">
          <button
            title="Hang up"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 hover:bg-red-50 transition-colors"
          >
            <PhoneOff className="w-4 h-4 text-red-500" />
            <span className="text-[9px] text-red-500 leading-none">Hang up</span>
          </button>
          <div className="w-px bg-[#D2D8DB]" />
          <button
            title="Outcome"
            onClick={(e) => { e.stopPropagation(); setOutcomeOpen(true); }}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 hover:bg-[#ECF3F8] transition-colors"
          >
            <CircleCheckBig className="w-4 h-4 text-[#005C99]" />
            <span className="text-[9px] text-[#526b7a] leading-none">Outcome</span>
          </button>
        </div>
      </div>

      {/* Outcome sheet — rendered outside the tile so it can escape overflow:hidden */}
      <OutcomeSheet
        open={outcomeOpen}
        onClose={() => setOutcomeOpen(false)}
        contact={contact}
      />
    </>
  );
}

/* ─── Contact tile ───────────────────────────────────────────────────────── */

export function ContactTile({ contact, isActive, onClick, onTransfer }: ContactTileProps) {
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (contact.channel !== "phone") return;
    const id = setInterval(() => setCallSeconds((s) => s + 1), 1_000);
    return () => clearInterval(id);
  }, [contact.channel]);

  const callTimeStr = `${Math.floor(callSeconds / 60)}:${(callSeconds % 60).toString().padStart(2, "0")}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className={cn(
        "relative w-full text-left rounded transition-colors group cursor-pointer overflow-hidden",
        "border border-[#D2D8DB] border-l-[3px]",
        isActive
          ? "bg-[#EAF1F7] border-l-[#003D7A]"
          : "bg-white border-l-transparent hover:bg-[#F5F8FA] hover:border-l-[#D2D8DB]"
      )}
    >
      {/* ── Header row ── */}
      <div className="flex items-start gap-2 px-2 pt-2 pb-1">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[14px] text-[#191C21] leading-tight truncate">
            {contact.name}
          </div>
          <div className="text-[12px] text-[#333] leading-snug truncate mt-0.5">
            {contact.queue}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-px h-8 bg-[#D2D8DB] mx-1" />
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3 text-[#333]" />
              <ChannelIcon channel={contact.channel} />
            </div>
            <div className="text-[11px] font-semibold text-black leading-none">
              {contact.channel === "phone" ? callTimeStr : contact.duration}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action row ── */}
      {contact.channel === "phone" ? (
        <PhoneCallControls
          contact={contact}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted((v) => !v)}
          onTransfer={onTransfer}
        />
      ) : isActive ? (
        <div className="flex items-center gap-2 px-2 pb-2 mt-1">
          <div className="flex-1 bg-white rounded shadow-sm border border-[#D2D8DB] flex items-center justify-around p-1">
            <button
              className="p-1 rounded hover:bg-[#ECF3F8] transition-colors"
              title="Transfer"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowRightLeft className="w-4 h-4 text-[#526b7a]" />
            </button>
            <div className="w-px h-6 bg-[#D2D8DB]" />
            <button
              className="p-1 rounded hover:bg-[#ECF3F8] transition-colors"
              title="Verify"
              onClick={(e) => e.stopPropagation()}
            >
              <CheckCircle className="w-4 h-4 text-[#526b7a]" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
