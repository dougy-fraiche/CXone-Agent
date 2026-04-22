"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
  Settings,
  Volume2,
  VolumeX,
  Play,
  BellOff,
  Mic,
  Clock,
  ArrowUpDown,
  Keyboard,
  PanelRight,
  CornerDownRight,
  PhoneIncoming,
  MessageSquare,
  Mail,
  MessageCircle,
  Voicemail,
  Search,
  Filter,
  Info,
  Volume1,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const CARD =
  "flex flex-col h-full bg-white border border-[#D2D8DB] rounded-lg shadow-sm overflow-hidden";

/* ─── Shared helpers ────────────────────────────────────────────────────────── */

/** Select with a small floating label above the border (notched outline style) */
function LabeledSelect({
  label,
  value,
  onValueChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onValueChange?: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="absolute -top-2 left-2.5 z-10 bg-white px-1 text-[10px] text-[#526b7a] leading-none pointer-events-none">
        {label}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Section label used in Login & Voice tab */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-[#526b7a] font-semibold uppercase tracking-wide mb-3">
      {children}
    </p>
  );
}

/* ─── Tab bar ────────────────────────────────────────────────────────────── */
const SETTING_TABS = [
  { id: "login", label: "Login & Voice Preferences" },
  { id: "av", label: "A/V Notifications" },
  { id: "display", label: "Display & Keyboard" },
  { id: "info", label: "Information" },
  { id: "skills", label: "Agent Skills" },
  { id: "report", label: "Report Issue" },
];

/* ─── Tab 1: Login & Voice Preferences ────────────────────────────────────── */
const RING_OPTIONS = [
  { value: "ring1", label: "Ring 1", src: "/audio/ring-1.wav" },
  { value: "ring2", label: "Ring 2", src: "/audio/ring-2.wav" },
  { value: "ring3", label: "Ring 3", src: "/audio/ring-3.wav" },
];
const RING_SRC_MAP: Record<string, string> = Object.fromEntries(
  RING_OPTIONS.map((o) => [o.value, o.src])
);

function LoginVoiceTab() {
  const [volume, setVolume] = useState([65]);
  const [autoAccept, setAutoAccept] = useState(false);
  const [ringtone, setRingtone] = useState("ring1");
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);

  function playRing(value: string) {
    const src = RING_SRC_MAP[value];
    if (!src) return;
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
    }
    const audio = new Audio(src);
    ringAudioRef.current = audio;
    audio.play().catch(() => {});
  }
  const [secondaryDevice, setSecondaryDevice] = useState("none");
  const [delaySeconds, setDelaySeconds] = useState("none");
  const [noiseMicOn, setNoiseMicOn] = useState(true);
  const [noiseSpeakerOn, setNoiseSpeakerOn] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState([50]);
  const [speakerSensitivity, setSpeakerSensitivity] = useState([40]);
  const [selectedDevices, setSelectedDevices] = useState("none");

  return (
    <div className="flex gap-10 px-6 py-6 overflow-y-auto h-full">
      {/* Left column */}
      <div className="w-[280px] shrink-0 flex flex-col gap-6">
        {/* Softphone */}
        <div>
          <SectionLabel>Softphone</SectionLabel>
          <div className="flex flex-col gap-4">
            {/* Volume slider */}
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-[#526b7a] shrink-0" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4 text-[#526b7a] shrink-0" />
            </div>

            {/* Auto Accept */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#333]">Auto Accept</span>
              <Switch checked={autoAccept} onCheckedChange={setAutoAccept} />
            </div>

            {/* Ringtone */}
            <div className="flex flex-col gap-1.5">
              <Label>Ringtone</Label>
              <div className="flex items-center gap-2">
                <Select value={ringtone} onValueChange={setRingtone}>
                  <SelectTrigger className="flex-1">
                    <SelectValue>
                      {RING_OPTIONS.find((o) => o.value === ringtone)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {RING_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => playRing(ringtone)}
                  className="w-8 h-8 flex items-center justify-center rounded text-[#526b7a] hover:bg-[#F5F8FA] transition-colors shrink-0"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Ringer */}
        <div>
          <SectionLabel>Secondary Ringer</SectionLabel>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Secondary Device</Label>
              <div className="flex items-center gap-2">
                <Select value={secondaryDevice} onValueChange={setSecondaryDevice}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="device1">Device 1</SelectItem>
                  </SelectContent>
                </Select>
                <BellOff className="w-4 h-4 text-[#B0BDCA] shrink-0" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Delay Seconds</Label>
              <Select value={delaySeconds} onValueChange={setDelaySeconds}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Noise Cancellation */}
        <div>
          <SectionLabel>Noise Cancellation</SectionLabel>
          <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-500">
            <Info />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription className="text-blue-700">
              To use the Noise Cancellation feature, it is recommended to
              install the CXone Noise Cancellation Extension from the Chrome Web
              Store.{" "}
              <span className="text-blue-600 cursor-pointer hover:underline">
                Click here for details
              </span>
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-4">
            {/* Mic */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-4 h-4 text-[#526b7a]" />
                <Switch checked={noiseMicOn} onCheckedChange={setNoiseMicOn} />
              </div>
              <p className="text-[12px] text-[#526b7a] mb-1.5">
                Mic Sensitivity
              </p>
              <Slider
                value={micSensitivity}
                onValueChange={setMicSensitivity}
                min={0}
                max={100}
                step={1}
              />
            </div>
            {/* Speaker */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Volume1 className="w-4 h-4 text-[#526b7a]" />
                <Switch
                  checked={noiseSpeakerOn}
                  onCheckedChange={setNoiseSpeakerOn}
                />
              </div>
              <p className="text-[12px] text-[#526b7a] mb-1.5">
                Speaker Sensitivity
              </p>
              <Slider
                value={speakerSensitivity}
                onValueChange={setSpeakerSensitivity}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="flex-1 flex flex-col gap-5">
        <h3 className="text-[15px] font-semibold text-[#333]">
          Jabra Call Control
        </h3>
        <p className="text-[13px] text-[#526b7a]">
          Use your headset to answer and end calls, mute and other features
          supported by your headset.
        </p>

        <div>
          <h4 className="text-[13px] font-semibold text-[#333] mb-1.5">
            Add Devices
          </h4>
          <p className="text-[13px] text-[#526b7a] mb-2">
            Choose Add Devices button to select which headset(s) you will be
            using. You will be asked to provide consent before adding devices.
          </p>
          <button className="text-[13px] text-[#007AB8] hover:underline">
            Add Devices
          </button>
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-[#333] mb-1.5">
            Selected Devices
          </h4>
          <p className="text-[13px] text-[#526b7a] mb-3">
            Any added devices will appear here.
          </p>
          <div className="flex flex-col gap-1.5 max-w-[220px]">
            <Label>Selected Devices</Label>
            <Select value={selectedDevices} onValueChange={setSelectedDevices}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Devices</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab 2: A/V Notifications ─────────────────────────────────────────────── */
const AV_ROWS = [
  { id: "agent-msg", label: "New Agent Message", tone: "tone1" },
  { id: "contact", label: "New Contact", tone: "tone2" },
  { id: "contact-reply", label: "New Contact Reply", tone: "tone3" },
  { id: "end-chat", label: "End Chat or Call", tone: "tone4" },
];
const TONE_OPTIONS = [
  { value: "tone1", label: "Tone 1", src: "/audio/tone-1.wav" },
  { value: "tone2", label: "Tone 2", src: "/audio/tone-2.wav" },
  { value: "tone3", label: "Tone 3", src: "/audio/tone-3.wav" },
  { value: "tone4", label: "Tone 4", src: "/audio/tone-4.wav" },
  { value: "tone5", label: "Tone 5", src: "/audio/tone-5.wav" },
  { value: "tone6", label: "Tone 6", src: "/audio/tone-6.wav" },
  { value: "tone7", label: "Tone 7", src: "/audio/tone-7.wav" },
  { value: "tone8", label: "Tone 8", src: "/audio/tone-8.wav" },
];

const TONE_SRC_MAP: Record<string, string | null> = Object.fromEntries(
  TONE_OPTIONS.map((o) => [o.value, o.src])
);

function AVNotificationsTab() {
  const [audioToggles, setAudioToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(AV_ROWS.map((r) => [r.id, false]))
  );
  const [tones, setTones] = useState<Record<string, string>>(
    Object.fromEntries(AV_ROWS.map((r) => [r.id, r.tone]))
  );
  const [visualToggles, setVisualToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(AV_ROWS.map((r) => [r.id, false]))
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playTone(toneValue: string) {
    const src = TONE_SRC_MAP[toneValue];
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.play().catch(() => {/* ignore autoplay policy errors */});
  }

  return (
    <div className="flex gap-16 px-6 py-6 overflow-y-auto h-full">
      {/* Audio Notifications */}
      <div className="flex-1">
        <h3 className="text-[16px] font-semibold text-[#005C99] mb-5">
          Audio Notifications
        </h3>
        <div className="flex flex-col gap-4">
          {AV_ROWS.map((row) => (
            <div key={row.id} className="flex items-center gap-4">
              {/* Row label */}
              <Label className="w-40 shrink-0 font-normal">
                {row.label}
              </Label>

              {/* Toggle */}
              <Switch
                checked={audioToggles[row.id]}
                onCheckedChange={(v) =>
                  setAudioToggles((p) => ({ ...p, [row.id]: v }))
                }
              />

              {/* Tone select — plain shadcn Select, no floating label */}
              <Select
                value={tones[row.id]}
                onValueChange={(v) =>
                  setTones((p) => ({ ...p, [row.id]: v }))
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue>
                    {TONE_OPTIONS.find((o) => o.value === tones[row.id])?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Play preview button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => playTone(tones[row.id])}
                disabled={!TONE_SRC_MAP[tones[row.id]]}
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Notifications */}
      <div className="flex-1">
        <h3 className="text-[16px] font-semibold text-[#005C99] mb-5">
          Visual Notifications
        </h3>
        <div className="flex flex-col gap-4">
          {AV_ROWS.map((row) => (
            <div key={row.id} className="flex items-center gap-4">
              <Label className="w-40 shrink-0 font-normal">
                {row.label}
              </Label>
              <Switch
                checked={visualToggles[row.id]}
                onCheckedChange={(v) =>
                  setVisualToggles((p) => ({ ...p, [row.id]: v }))
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab 3: Display & Keyboard ────────────────────────────────────────────── */
const SHORTCUTS = [
  {
    group: "Top Navigation Shortcuts",
    items: [
      { action: "Focus Top Navigation", shortcut: "Alt + T" },
      { action: "Open CX Help Page", shortcut: "Ctrl + F2" },
      { action: "Open Notifications", shortcut: "Ctrl + Alt + N" },
      { action: "Connect Agent Voice Link (Agent Leg)", shortcut: "Ctrl + Alt + C" },
      { action: "Focus Agent States", shortcut: "Ctrl + Alt + O" },
    ],
  },
  {
    group: "Quick Bar Shortcuts",
    items: [
      { action: "Go To Home (Contact History)", shortcut: "Ctrl + Shift + H" },
      { action: "Open Interaction Search", shortcut: "Ctrl + Shift + 1" },
      { action: "Open Queue Counter", shortcut: "Ctrl + Shift + Q" },
    ],
  },
];

function DisplayKeyboardTab() {
  const [time24, setTime24] = useState(false);
  const [panelGeneral, setPanelGeneral] = useState(false);
  const [panelPageAction, setPanelPageAction] = useState(true);
  const [emailSort, setEmailSort] = useState("oldest");
  const [sendEnter, setSendEnter] = useState("all-except-email");

  return (
    <div className="px-6 py-6 overflow-y-auto h-full flex flex-col gap-6">
      {/* Display section */}
      <div>
        <p className="text-[14px] font-bold text-[#333] mb-4">Display</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#526b7a]" />
              <span className="text-[13px] text-[#333]">24 hour time</span>
            </div>
            <Switch checked={time24} onCheckedChange={setTime24} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PanelRight className="w-4 h-4 text-[#526b7a]" />
              <span className="text-[13px] text-[#333]">
                Panel Open in Browser: General
              </span>
            </div>
            <Switch checked={panelGeneral} onCheckedChange={setPanelGeneral} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PanelRight className="w-4 h-4 text-[#526b7a]" />
              <span className="text-[13px] text-[#333]">
                Panel Open in Browser: Page Action Only
              </span>
            </div>
            <Switch
              checked={panelPageAction}
              onCheckedChange={setPanelPageAction}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#526b7a]" />
              <span className="text-[13px] text-[#333]">
                Email Message Sort Order
              </span>
            </div>
            <Select value={emailSort} onValueChange={setEmailSort}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oldest">Oldest to newest (default)</SelectItem>
                <SelectItem value="newest">Newest to oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Keyboard section */}
      <div>
        <p className="text-[14px] font-bold text-[#333] mb-4">Keyboard</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-[#526b7a]" />
              <span className="text-[13px] text-[#333]">Send with Enter</span>
            </div>
            <Select value={sendEnter} onValueChange={setSendEnter}>
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-except-email">
                  All channels except email
                </SelectItem>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shortcuts label */}
          <div className="flex items-center gap-2 mb-1">
            <Keyboard className="w-4 h-4 text-[#526b7a]" />
            <span className="text-[13px] text-[#333]">Shortcuts</span>
          </div>

          {/* Shortcuts table */}
          <div className="border border-[#D2D8DB] rounded-md overflow-hidden max-w-xl">
            <div className="flex border-b border-[#D2D8DB] bg-[#F5F8FA]">
              <div className="flex-1 px-4 py-2 text-[11px] font-bold text-[#526b7a] uppercase tracking-wide">
                ACTION
              </div>
              <div className="w-40 px-4 py-2 text-[11px] font-bold text-[#526b7a] uppercase tracking-wide">
                SHORTCUT
              </div>
            </div>
            {SHORTCUTS.map((group) => (
              <div key={group.group}>
                <div className="flex px-4 py-2 bg-[#F5F8FA] border-b border-[#D2D8DB]">
                  <span className="text-[12px] font-bold text-[#333]">
                    {group.group}
                  </span>
                </div>
                {group.items.map((item, idx) => (
                  <div
                    key={item.action}
                    className={cn(
                      "flex",
                      idx < group.items.length - 1 &&
                        "border-b border-[#EBEBEB]"
                    )}
                  >
                    <div className="flex-1 px-4 py-2.5 text-[13px] text-[#333]">
                      {item.action}
                    </div>
                    <div className="w-40 px-4 py-2.5 text-[13px] text-[#526b7a]">
                      {item.shortcut}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab 4: Information ────────────────────────────────────────────────────── */
const INFO_ROWS: { label: string; value: string }[][] = [
  [
    { label: "AGENT NAME", value: "Douglas Clement" },
    { label: "DISPLAYED USERNAME", value: "doug.clement@ux-prod-beta.com" },
    { label: "AGENT ID", value: "39721788" },
  ],
  [
    { label: "VERSION 26.1.3.2-AGENT", value: "28bf1ab98f" },
    { label: "STATION ID", value: "N/A" },
    { label: "SESSION ID", value: "699758020523" },
  ],
  [
    { label: "PHONE NUMBER", value: "WebRTC" },
    { label: "AGENT LEG ID", value: "N/A" },
    { label: "CALLER ID", value: "" },
  ],
  [
    { label: "BROWSER VERSION", value: "Chrome 147" },
    { label: "WEB SERVER", value: "--" },
    { label: "VIRTUAL CLUSTER", value: "AOA-B32AGM01" },
  ],
  [
    { label: "BROWSER LANGUAGE", value: "en-US" },
    { label: "BROWSER LOCALIZATION", value: "en-US" },
    { label: "TEAM NAME", value: "UX Avengers" },
  ],
];

const ROUTING_ROWS: { label: string; value: string }[][] = [
  [
    { label: "CONTACT LIMIT", value: "1 Call, 1 Digital" },
    { label: "TOTAL LIMIT", value: "1" },
    { label: "ROUTING", value: "Omni" },
  ],
  [
    { label: "REQUEST CONTACT", value: "Disabled" },
    { label: "CONTACT AUTO FOCUS", value: "Disabled" },
  ],
];

const LAG_MAX = 4;
const LAG_VALUE = 0.13;

function InformationTab() {
  const [logLevel, setLogLevel] = useState("error");
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="px-6 py-6 overflow-y-auto h-full flex flex-col gap-6">
      {/* Platform Connection Status */}
      <div className="border border-[#D2D8DB] rounded-md p-4">
        <p className="text-[12px] font-bold text-[#005C99] uppercase tracking-wide mb-3">
          Platform Connection Status
        </p>
        <div className="flex items-start gap-8">
          <div className="shrink-0">
            <p className="text-[12px] text-[#526b7a]">
              {dateStr} {timeStr}
            </p>
            <p className="text-[13px] text-[#333] mt-1">
              Your connection lag time is{" "}
              <strong>{LAG_VALUE} Seconds</strong>
            </p>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#526b7a]">0</span>
              <span className="text-[11px] text-[#526b7a]">
                Connection lag time in seconds
              </span>
              <span className="text-[11px] text-[#526b7a]">
                {LAG_MAX}.00
              </span>
            </div>
            {/* Gradient bar */}
            <div
              className="relative h-3.5 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #22c55e 0%, #eab308 40%, #f97316 70%, #ef4444 100%)",
              }}
            >
              {/* Triangle marker below bar */}
              <div
                className="absolute top-full mt-0.5"
                style={{
                  left: `${(LAG_VALUE / LAG_MAX) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderBottom: "7px solid #333",
                  }}
                />
              </div>
            </div>
            {/* Lag value label */}
            <div
              className="relative mt-3"
            >
              <span
                className="text-[11px] text-[#333] font-semibold absolute"
                style={{
                  left: `${(LAG_VALUE / LAG_MAX) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {LAG_VALUE}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="border border-[#D2D8DB] rounded-md overflow-hidden">
        {INFO_ROWS.map((row, ri) => (
          <div
            key={ri}
            className={cn(
              "grid grid-cols-3",
              ri < INFO_ROWS.length - 1 && "border-b border-[#D2D8DB]"
            )}
          >
            {row.map((cell) => (
              <div key={cell.label} className="px-4 py-3">
                <p className="text-[11px] font-bold text-[#005C99] uppercase tracking-wide mb-0.5">
                  {cell.label}
                </p>
                <p className="text-[13px] text-[#333]">
                  {cell.value || "\u00a0"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Interaction Routing */}
      <div>
        <p className="text-[14px] font-semibold text-[#005C99] mb-3">
          Interaction Routing
        </p>
        <div className="border border-[#D2D8DB] rounded-md overflow-hidden">
          {ROUTING_ROWS.map((row, ri) => (
            <div
              key={ri}
              className={cn(
                "grid grid-cols-3",
                ri < ROUTING_ROWS.length - 1 && "border-b border-[#D2D8DB]"
              )}
            >
              {row.map((cell) => (
                <div key={cell.label} className="px-4 py-3">
                  <p className="text-[11px] font-bold text-[#005C99] uppercase tracking-wide mb-0.5">
                    {cell.label}
                  </p>
                  <p className="text-[13px] text-[#333]">{cell.value}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Logging Configuration */}
      <div>
        <p className="text-[14px] font-semibold text-[#005C99] mb-3">
          Logging Configuration
        </p>
        <div className="relative w-40">
          <span className="absolute -top-2 left-2.5 z-10 bg-white px-1 text-[10px] text-[#526b7a] leading-none">
            Log Level
          </span>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab 5: Agent Skills ───────────────────────────────────────────────────── */
type SkillDef = {
  id: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
};

const ALL_SKILLS: SkillDef[] = [
  { id: "auto-attendant", label: "Auto Attendant", Icon: PhoneIncoming, color: "text-purple-600" },
  { id: "phone-skill", label: "Phone skill", Icon: PhoneIncoming, color: "text-purple-600" },
  { id: "ux-chat", label: "UX Chat", Icon: MessageSquare, color: "text-green-600" },
  { id: "ux-email", label: "UX Email", Icon: Mail, color: "text-pink-600" },
  { id: "ux-inbound-phone", label: "UX Inbound Phone", Icon: PhoneIncoming, color: "text-purple-600" },
  { id: "ux-sms", label: "UX SMS", Icon: MessageCircle, color: "text-orange-500" },
  { id: "ux-voicemail", label: "UX Voicemail", Icon: Voicemail, color: "text-red-500" },
];

function AgentSkillsTab() {
  const [search, setSearch] = useState("");

  const filtered = ALL_SKILLS.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-6 py-6 flex flex-col gap-4 h-full overflow-y-auto">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#526b7a]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="pl-9 pr-9"
        />
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#526b7a]" />
      </div>

      {/* Assigned Skills label */}
      <p className="text-[13px] font-bold text-[#333]">
        Assigned Skills ({ALL_SKILLS.length})
      </p>

      {/* Skills list */}
      <div className="flex flex-col">
        {filtered.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-3 py-3 border-b border-[#EBEBEB] last:border-b-0"
          >
            <skill.Icon className={cn("w-5 h-5 shrink-0", skill.color)} />
            <span className="text-[13px] text-[#333]">{skill.label}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[13px] text-[#526b7a] py-4 text-center">
            No skills match your search.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Tab 6: Report Issue ───────────────────────────────────────────────────── */
const CATEGORY_OPTIONS = [
  { value: "audio", label: "Audio / Video" },
  { value: "connectivity", label: "Connectivity" },
  { value: "ui", label: "UI / Display" },
  { value: "routing", label: "Routing" },
  { value: "other", label: "Other" },
];
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const reportIssueSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  includeLog: z.boolean(),
});

type ReportIssueValues = z.infer<typeof reportIssueSchema>;

function ReportIssueTab() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReportIssueValues>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: { category: "", priority: "", comment: "", includeLog: false },
  });

  async function onSubmit(_values: ReportIssueValues) {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="px-6 py-6 flex flex-col items-center justify-center h-full gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[15px] font-bold text-[#333]">Report Submitted</p>
        <p className="text-[13px] text-[#526b7a] max-w-xs">Thank you. Our support team will review your report shortly.</p>
        <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); form.reset(); }}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 overflow-y-auto h-full">
      <p className="text-[15px] font-bold text-[#333] mb-6">Report an Issue</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-[300px]">
                <FormLabel className="text-[11px] font-bold text-[#333] uppercase tracking-wide">
                  Category <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="w-[300px]">
                <FormLabel className="text-[11px] font-bold text-[#333] uppercase tracking-wide">
                  Priority <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="w-[300px]">
                <FormLabel className="text-[11px] font-bold text-[#333] uppercase tracking-wide">
                  Comment <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea {...field} className="h-44 resize-none" placeholder="Describe the issue…" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeLog"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-[13px] text-[#526b7a] font-normal cursor-pointer !mt-0">
                  Include Event Log
                </FormLabel>
              </FormItem>
            )}
          />

          <div>
            <Button type="submit" disabled={submitting} className="min-w-[80px]">
              {submitting ? <Spinner className="w-4 h-4" /> : "Send"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

/* ─── Settings Page ─────────────────────────────────────────────────────────── */
export function SettingsPage({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className={cn(CARD, className)}>
      {/* Page header */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
        <Settings className="w-4 h-4 text-[#005C99] shrink-0" />
        <span className="text-[15px] font-semibold text-[#333]">Settings</span>
      </div>

      {/* Tab bar */}
      <div className="flex items-end gap-0 px-2 border-b border-[#D2D8DB] shrink-0 overflow-x-auto">
        {SETTING_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium transition-colors shrink-0",
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
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "login" && <LoginVoiceTab />}
        {activeTab === "av" && <AVNotificationsTab />}
        {activeTab === "display" && <DisplayKeyboardTab />}
        {activeTab === "info" && <InformationTab />}
        {activeTab === "skills" && <AgentSkillsTab />}
        {activeTab === "report" && <ReportIssueTab />}
      </div>
    </div>
  );
}
