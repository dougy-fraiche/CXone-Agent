
import { ChevronDown, ChevronRight, Trash2, CheckCircle2, SendHorizontal, Bot, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Contact } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AIPanelProps {
  contact: Contact;
  queries?: string[];
  className?: string;
}

/* ─── Shared card styles ─────────────────────────────────────────────────── */
const BLUE_CARD = "border border-[#A9C8E0] rounded-lg bg-[#E8F3FB] overflow-hidden";
const CARD_TITLE = "text-[11px] font-bold tracking-wide text-[#003D7A] uppercase";
const HEADER_BTN = "flex items-center gap-2 w-full px-3 pt-2.5 pb-2 hover:bg-[#D6E9F6] transition-colors";
const HEADER_DIV = "flex items-center justify-between px-3 pt-2.5 pb-2";

/* ─── Child animation helpers ────────────────────────────────────────────── */
/**
 * Returns the effective base delay for child items inside a card.
 * On first load it equals `baseDelay` so children appear after the card.
 * After initial animations finish it resets to 0, making re-opens snappy.
 */
function useChildDelay(baseDelay: number): number {
  const [resolved, setResolved] = useState(baseDelay);
  useEffect(() => {
    const timer = setTimeout(() => setResolved(0), baseDelay + 1200);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return resolved;
}

/** Compute animationDelay string: childBase + 150ms gap + n×80ms stagger */
const cd = (childBase: number, n: number): string =>
  `${childBase + 150 + n * 80}ms`;

/* ─── Root panel ─────────────────────────────────────────────────────────── */

export function AIPanel({ contact, queries = [], className }: AIPanelProps) {
  const cards = [
    (d: number) => <CustomerProfileCard contact={contact} baseDelay={d} />,
    (d: number) => <CustomerContextCard contact={contact} baseDelay={d} />,
    (d: number) => <AttemptedResolutionCard baseDelay={d} />,
    (d: number) => <SuggestedNextStepsCard baseDelay={d} />,
  ];

  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      <div className="flex flex-col gap-2 p-4">
        {cards.map((render, i) => {
          const delay = 2000 + i * 700;
          return (
            <div key={i} className="animate-card-in" style={{ animationDelay: `${delay}ms` }}>
              {render(delay)}
            </div>
          );
        })}
        {queries.map((q, i) => (
          <div key={`q-${i}`} className="animate-card-in">
            <CopilotResponseCard query={q} />
          </div>
        ))}
        <div className="shrink-0 h-4" />
      </div>
    </div>
  );
}

/* ─── Risk score helpers ──────────────────────────────────────────────────── */
function riskTextColor(score: number): string {
  if (score <= 40) return "text-green-600";
  if (score <= 70) return "text-amber-500";
  return "text-red-500";
}
function riskBarColor(score: number): string {
  if (score <= 40) return "bg-green-500";
  if (score <= 70) return "bg-amber-400";
  return "bg-red-500";
}

/* ─── Customer Profile ───────────────────────────────────────────────────── */
function CustomerProfileCard({ contact, baseDelay = 0 }: { contact: Contact; baseDelay?: number }) {
  const [open, setOpen] = useState(true);
  const childBase = useChildDelay(baseDelay);
  const { profile } = contact;

  return (
    <div className={BLUE_CARD}>
      <button onClick={() => setOpen((o) => !o)} className={HEADER_BTN}>
        <span className={cn(CARD_TITLE, "flex-1 text-left")}>Customer Profile</span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#003D7A] shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[#003D7A] shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-3">
          {/* Avatar + name + balance */}
          <div
            className="flex items-start gap-2.5 animate-card-in"
            style={{ animationDelay: cd(childBase, 0) }}
          >
            <div className="w-9 h-9 rounded-full bg-[#003D7A] flex items-center justify-center shrink-0">
              <span className="text-[13px] font-bold text-white">{profile.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#191919] leading-tight">{contact.name}</p>
              <p className="text-[11px] text-[#526b7a] leading-tight mt-0.5">
                {profile.accountType} · {profile.tenureYears} yr{profile.tenureYears !== 1 ? "s" : ""} tenure
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-[#526b7a]">Balance</p>
              <p className="text-[13px] font-semibold text-[#191919]">{profile.balance}</p>
            </div>
          </div>

          {/* Metric mini-cards */}
          <div
            className="grid grid-cols-2 gap-2 animate-card-in"
            style={{ animationDelay: cd(childBase, 1) }}
          >
            <div className="bg-white rounded-lg p-2.5 border border-[#C4DBF0]">
              <p className="text-[10px] text-[#526b7a] mb-1">Fraud Risk Score</p>
              <p className={cn("text-[15px] font-bold leading-tight", riskTextColor(profile.fraudRiskScore))}>
                {profile.fraudRiskScore}{" "}
                <span className="text-[11px] font-normal text-[#526b7a]">/ 100</span>
              </p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                <div
                  className={cn("h-full rounded-full", riskBarColor(profile.fraudRiskScore))}
                  style={{ width: `${profile.fraudRiskScore}%` }}
                />
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-[#C4DBF0]">
              <p className="text-[10px] text-[#526b7a] mb-1">Prior Disputes</p>
              <p className="text-[15px] font-bold text-[#191919] leading-tight">{profile.priorDisputes}</p>
              <p className="text-[10px] text-[#526b7a] mt-0.5">
                Card: {profile.cardBlocked ? "BLOCKED" : "NOT blocked"}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div
            className="flex items-center gap-1.5 flex-wrap animate-card-in"
            style={{ animationDelay: cd(childBase, 2) }}
          >
            {profile.badges.map((badge) => (
              <Badge
                key={badge.label}
                variant="outline"
                className={cn(
                  "rounded-full",
                  badge.type === "green" && "bg-green-50 text-green-700 border-green-500 hover:bg-green-100",
                  badge.type === "red"   && "bg-red-50 text-red-600 border-red-400 hover:bg-red-100"
                )}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Customer Context ───────────────────────────────────────────────────── */
function CustomerContextCard({ contact, baseDelay = 0 }: { contact: Contact; baseDelay?: number }) {
  const childBase = useChildDelay(baseDelay);

  return (
    <div className={BLUE_CARD}>
      <div className={HEADER_DIV}>
        <span className={CARD_TITLE}>Customer Context</span>
      </div>
      <div className="px-3 pb-3">
        <p
          className="text-[12px] text-[#333] leading-relaxed animate-card-in"
          style={{ animationDelay: cd(childBase, 0) }}
        >
          {contact.profile.contextSummary}
        </p>
      </div>
    </div>
  );
}

/* ─── Attempted Resolution ───────────────────────────────────────────────── */
const RESOLUTION_BULLETS = [
  "Reviewed the full chat thread and extracted the core issue from Fatima's messages.",
  "Checked account history and cross-referenced any recent interactions flagged on the account.",
  "Assessed conversation tone and confirmed standard escalation path was appropriate.",
  "Prepared a suggested response draft and identified relevant knowledge base articles.",
];

function AttemptedResolutionCard({ baseDelay = 0 }: { baseDelay?: number }) {
  const [open, setOpen] = useState(true);
  const childBase = useChildDelay(baseDelay);

  return (
    <div className={BLUE_CARD}>
      <button onClick={() => setOpen((o) => !o)} className={HEADER_BTN}>
        <span className={cn(CARD_TITLE, "flex-1 text-left")}>Attempted Resolution</span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#003D7A] shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[#003D7A] shrink-0" />
        )}
      </button>

      {open && (
        <ul className="px-3 pb-3 flex flex-col gap-2">
          {RESOLUTION_BULLETS.map((text, i) => (
            <li
              key={i}
              className="flex items-start gap-2 animate-card-in"
              style={{ animationDelay: cd(childBase, i) }}
            >
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#003D7A] shrink-0" />
              <p className="text-[12px] text-[#333] leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Suggested Next Steps ───────────────────────────────────────────────── */
type StepStatus = "idle" | "running" | "done";

interface Step {
  label: string;
  status: StepStatus;
}

interface ActionItem {
  id: string;
  label: string;
  checked: boolean;
  steps: Step[];
}

const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: "escalate",
    label: "Escalate to Supervisor",
    checked: false,
    steps: [
      { label: "Finding available supervisor", status: "idle" },
      { label: "Transferring conversation notes", status: "idle" },
      { label: "Notifying supervisor", status: "idle" },
    ],
  },
  {
    id: "adp",
    label: "Create ADP Ticket",
    checked: false,
    steps: [
      { label: "Retrieving ticket template", status: "idle" },
      { label: "Populating case details", status: "idle" },
      { label: "Submitting ticket", status: "idle" },
    ],
  },
  {
    id: "resolve",
    label: "Set Case to Resolved",
    checked: false,
    steps: [
      { label: "Verifying resolution criteria", status: "idle" },
      { label: "Updating case status", status: "idle" },
      { label: "Sending closure email", status: "idle" },
    ],
  },
];

function SuggestedNextStepsCard({ baseDelay = 0 }: { baseDelay?: number }) {
  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS);
  const [copilotInput, setCopilotInput] = useState("");
  const childBase = useChildDelay(baseDelay);

  const animateItem = useCallback((id: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, checked: true, steps: a.steps.map((s) => ({ ...s, status: "idle" as StepStatus })) }
          : a
      )
    );

    const delays = [0, 700, 1400];
    delays.forEach((delay, stepIdx) => {
      setTimeout(() => {
        setActions((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, steps: a.steps.map((s, i) => (i === stepIdx ? { ...s, status: "running" as StepStatus } : s)) }
              : a
          )
        );
      }, delay);

      setTimeout(() => {
        setActions((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, steps: a.steps.map((s, i) => (i === stepIdx ? { ...s, status: "done" as StepStatus } : s)) }
              : a
          )
        );
      }, delay + 600);
    });
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      const item = actions.find((a) => a.id === id);
      if (!item) return;
      if (!item.checked) {
        animateItem(id);
      } else {
        setActions((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, checked: false, steps: a.steps.map((s) => ({ ...s, status: "idle" as StepStatus })) }
              : a
          )
        );
      }
    },
    [actions, animateItem]
  );

  const handlePerformAll = useCallback(() => {
    actions.forEach((a) => {
      if (!a.checked) animateItem(a.id);
    });
  }, [actions, animateItem]);

  return (
    <div className={BLUE_CARD}>
      <div className={HEADER_DIV}>
        <span className={CARD_TITLE}>Suggested Next Steps</span>
      </div>

      <div className="px-3 pb-3 flex flex-col gap-3">
        {/* Summary */}
        <p
          className="text-[12px] text-[#526b7a] leading-relaxed animate-card-in"
          style={{ animationDelay: cd(childBase, 0) }}
        >
          Fatima's account shows signs of compromise — a suspicious session triggered a bulk data
          export. This is a high-priority security incident requiring immediate escalation and
          containment. Here are my suggested actions, or ask me for more assistance.
        </p>

        {/* Action items */}
        <div
          className="flex flex-col gap-1.5 animate-card-in"
          style={{ animationDelay: cd(childBase, 1) }}
        >
          {actions.map((action) => (
            <div key={action.id} className="flex flex-col">
              <div className="bg-white rounded-lg border border-[#C4DBF0] px-3 py-2.5 flex items-center gap-2.5">
                <Checkbox
                  checked={action.checked}
                  onCheckedChange={() => handleToggle(action.id)}
                  className="shrink-0"
                />
                <span
                  className={cn(
                    "flex-1 text-[12px] font-medium leading-tight",
                    action.checked ? "line-through text-[#8fa3b1]" : "text-[#191919]"
                  )}
                >
                  {action.label}
                </span>
                <button
                  onClick={() => setActions((prev) => prev.filter((a) => a.id !== action.id))}
                  className="text-[#8fa3b1] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {action.checked && (
                <div className="bg-white rounded-b-lg border-x border-b border-[#C4DBF0] px-3 py-2.5 -mt-1 pt-3 flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#191919]">{action.label}ing…</p>
                  {action.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {step.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      ) : step.status === "running" ? (
                        <Spinner className="w-4 h-4 text-[#526b7a] shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#C4D4DF] shrink-0" />
                      )}
                      <span className={cn("text-[11px]", step.status === "idle" ? "text-[#191919]" : "text-[#8fa3b1]")}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Perform All Actions */}
        <div className="animate-card-in" style={{ animationDelay: cd(childBase, 2) }}>
          <Button
            onClick={handlePerformAll}
            className="w-full bg-[#0072B8] hover:bg-[#005A94] text-white text-sm rounded-lg"
          >
            Perform All Actions
          </Button>
        </div>

        {/* Ask Copilot input */}
        <div
          className="flex items-center gap-2 bg-white border border-[#C4DBF0] rounded-lg px-3 py-2 animate-card-in"
          style={{ animationDelay: cd(childBase, 3) }}
        >
          <Bot className="w-4 h-4 text-[#8fa3b1] shrink-0" />
          <input
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            placeholder="Ask Copilot to perform another action"
            className="flex-1 text-[12px] text-[#333] placeholder:text-[#8fa3b1] bg-transparent outline-none"
          />
          <button className="text-[#8fa3b1] hover:text-[#005C99] transition-colors">
            <SendHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Copilot response helpers ───────────────────────────────────────────── */

interface CopilotData {
  thoughtSteps: string[];
  response: string;
}

function generateCopilotResponse(query: string): CopilotData {
  const q = query.toLowerCase();

  const thoughtSteps = [
    "Reviewing case history and prior customer interactions...",
    "Analyzing attempted resolutions and their outcomes...",
    "Cross-referencing similar resolved cases in the knowledge base...",
    "Synthesizing recommended next steps and action items...",
  ];

  let response: string;

  if (q.match(/fraud|charg|card|unauthori/)) {
    response =
      "Based on the account analysis, this appears to be a fraudulent transaction. I recommend immediately blocking the card, opening a dispute for the unauthorized charges, and issuing a provisional credit within one business day. The customer should receive a replacement card via expedited delivery in 1–2 business days.";
  } else if (q.match(/bill|payment|invoice|fee|refund/)) {
    response =
      "The billing discrepancy stems from a proration error applied during a mid-cycle plan change. I recommend issuing a credit memo for the difference and walking the customer through their adjusted billing cycle. No further action should be needed after the correction is applied.";
  } else if (q.match(/password|login|access|lock|auth|sign.?in/)) {
    response =
      "The account access issue appears to be tied to a failed MFA configuration. I recommend resetting the authentication method, confirming the recovery email on file, and walking the customer through re-enrollment before ending the session.";
  } else if (q.match(/cancel|close|terminat/)) {
    response =
      "Before processing a cancellation, I recommend exploring retention options: a billing adjustment, a feature upgrade, or a temporary account pause. If the customer insists on closing, follow the standard offboarding checklist and confirm data export preferences.";
  } else if (q.match(/escalat|transfer|supervisor|manager/)) {
    response =
      "Escalation criteria are met based on the case history and interaction tone. I recommend transferring to Tier 2 with a full case summary attached, flagging the interaction as high priority, and notifying the on-duty supervisor before completing the transfer.";
  } else if (q.match(/slow|outage|down|error|bug|crash|broken/)) {
    response =
      "There is an active incident logged that matches the symptoms described. Engineering is aware and a fix is being deployed. I recommend acknowledging the impact to the customer, setting expectations on resolution time (ETA: ~2 hrs), and creating a follow-up task to confirm resolution after the incident clears.";
  } else if (q.match(/upgrade|plan|tier|feature/)) {
    response =
      "Based on the customer's usage patterns, they would benefit most from the Professional tier, which includes the features they've been requesting. I recommend walking them through the pricing difference and offering a 30-day trial of the upgraded tier before committing.";
  } else {
    response =
      "Based on the case analysis, the customer's issue appears to stem from an account configuration mismatch. The previous resolution attempts addressed symptoms but not the root cause. I recommend verifying the account settings directly, issuing a service credit for the disruption, and scheduling a follow-up within 48 hours to confirm resolution.";
  }

  return { thoughtSteps, response };
}

/* ─── Copilot Response Card ──────────────────────────────────────────────── */

type CopilotPhase = "thinking" | "complete";

function CopilotResponseCard({ query }: { query: string }) {
  const data = useRef<CopilotData>(generateCopilotResponse(query));
  const { thoughtSteps, response } = data.current;

  const [headerOpen, setHeaderOpen] = useState(true);
  const [thoughtExpanded, setThoughtExpanded] = useState(true);
  const [phase, setPhase] = useState<CopilotPhase>("thinking");

  const [started, setStarted] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [typedLines, setTypedLines] = useState<string[]>(() =>
    Array(thoughtSteps.length).fill("")
  );

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [typedLines, phase, started]);

  useEffect(() => {
    timerRef.current = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!started || phase === "complete") return;

    const line = thoughtSteps[lineIdx];
    const delay = charIdx === 0 && lineIdx > 0 ? 180 : 18;

    timerRef.current = setTimeout(() => {
      const nextChar = charIdx + 1;

      setTypedLines((prev) => {
        const next = [...prev];
        next[lineIdx] = line.slice(0, nextChar);
        return next;
      });

      if (nextChar >= line.length) {
        if (lineIdx < thoughtSteps.length - 1) {
          setLineIdx((l) => l + 1);
          setCharIdx(0);
        } else {
          timerRef.current = setTimeout(() => setPhase("complete"), 350);
        }
      } else {
        setCharIdx(nextChar);
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [started, lineIdx, charIdx, phase, thoughtSteps]);

  return (
    <div className="border border-[#A9C8E0] rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setHeaderOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 pt-2.5 pb-2 hover:bg-[#F5F8FA] transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#005C99] shrink-0" />
        <span className={cn(CARD_TITLE, "flex-1 text-left")}>Copilot Response</span>

        {phase === "thinking" && (
          <span className="flex items-center gap-[3px] mr-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#005C99] animate-bounce"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </span>
        )}

        {headerOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#003D7A] shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[#003D7A] shrink-0" />
        )}
      </button>

      {headerOpen && (
        <div className="px-3 pb-3 flex flex-col gap-3">
          <p className="text-[12px] italic text-[#526b7a]">"{query}"</p>

          {(started || phase === "complete") && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setThoughtExpanded((o) => !o)}
                className="flex items-center gap-1.5 text-left w-fit"
              >
                <span className="text-[12px] text-[#526b7a]">
                  {phase === "thinking" ? "Thinking..." : "Thought process"}
                </span>
                {thoughtExpanded ? (
                  <ChevronDown className="w-3 h-3 text-[#8fa3b1]" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#8fa3b1]" />
                )}
              </button>

              {thoughtExpanded && (
                <div className="border-l-2 border-[#A9C8E0] pl-3 mt-1 flex flex-col gap-1.5">
                  {typedLines.map((line, i) =>
                    line.length > 0 ? (
                      <p key={i} className="text-[11px] text-[#8fa3b1] leading-relaxed">
                        {line}
                        {phase === "thinking" && i === lineIdx && (
                          <span className="inline-block w-px h-3 bg-[#8fa3b1] ml-px align-middle animate-pulse" />
                        )}
                      </p>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}

          {phase === "complete" && (
            <div className="rounded-xl border border-[#A9C8E0] bg-[#DFF0FA] px-4 py-3">
              <p className="text-[13px] text-[#1a2a38] leading-relaxed">{response}</p>
            </div>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
