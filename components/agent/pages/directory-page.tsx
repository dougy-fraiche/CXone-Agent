"use client";

import { useState, useMemo } from "react";
import {
  BookUser,
  Search,
  Star,
  UserCircle2,
  Wrench,
  Users,
  MinusCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CARD =
  "flex flex-col h-full bg-white border border-[#D2D8DB] rounded-lg shadow-sm overflow-hidden";

/* ─── Data ──────────────────────────────────────────────────────────────────── */

type AgentStatus = "available" | "unavailable" | "busy" | "logged-out";

interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  team: string;
}

interface Skill {
  id: string;
  name: string;
  available: boolean;
  queue: number;
  waitMin: number;
}

interface Team {
  id: string;
  name: string;
  members: number;
}

const ALL_AGENTS: Agent[] = [
  { id: "a1", name: "Priya Nair",        status: "available",   team: "Customer Success" },
  { id: "a2", name: "Marcus Bell",       status: "busy",        team: "Customer Success" },
  { id: "a3", name: "Jordan Ellis",      status: "unavailable", team: "Technical Support" },
  { id: "a4", name: "Sofia Reyes",       status: "available",   team: "Billing" },
  { id: "a5", name: "Liam Okafor",       status: "logged-out",  team: "Technical Support" },
  { id: "a6", name: "Camille Dubois",    status: "available",   team: "Sales" },
  { id: "a7", name: "Tariq Hassan",      status: "busy",        team: "Customer Success" },
  { id: "a8", name: "Yuki Tanaka",       status: "logged-out",  team: "Billing" },
];

const ALL_SKILLS: Skill[] = [
  { id: "s1", name: "General Inquiries",   available: true,  queue: 4,  waitMin: 3  },
  { id: "s2", name: "Billing Support",     available: true,  queue: 2,  waitMin: 1  },
  { id: "s3", name: "Technical Support",   available: false, queue: 0,  waitMin: 0  },
  { id: "s4", name: "Sales — Inbound",     available: true,  queue: 7,  waitMin: 6  },
  { id: "s5", name: "Escalations",         available: false, queue: 0,  waitMin: 0  },
  { id: "s6", name: "Spanish Language",    available: true,  queue: 1,  waitMin: 2  },
];

const ALL_TEAMS: Team[] = [
  { id: "t1", name: "Customer Success",   members: 12 },
  { id: "t2", name: "Technical Support",  members: 8  },
  { id: "t3", name: "Billing",            members: 5  },
  { id: "t4", name: "Sales",              members: 9  },
  { id: "t5", name: "Quality Assurance",  members: 4  },
  { id: "t6", name: "Workforce Management", members: 3 },
];

const PREVIEW_COUNT = 3;

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function StatusIndicator({ status }: { status: AgentStatus }) {
  if (status === "available")
    return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />;
  if (status === "busy")
    return <Circle className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 shrink-0" />;
  if (status === "unavailable")
    return <MinusCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
  return <MinusCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
}

function StatusLabel({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, string> = {
    available: "Available",
    busy: "On Call",
    unavailable: "Unavailable",
    "logged-out": "Logged Out",
  };
  return <span className="text-xs text-muted-foreground">{map[status]}</span>;
}

function StarButton({ starred, onToggle }: { starred: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="text-muted-foreground hover:text-yellow-400 transition-colors p-1 shrink-0"
    >
      <Star className={cn("w-4 h-4", starred && "fill-yellow-400 text-yellow-400")} />
    </button>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-2">
      {icon}
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );
}

function LoadMore({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
    >
      load more…
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */

export function DirectoryPage({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [agentLimit, setAgentLimit]  = useState(PREVIEW_COUNT);
  const [skillLimit, setSkillLimit]  = useState(PREVIEW_COUNT);
  const [teamLimit,  setTeamLimit]   = useState(PREVIEW_COUNT);

  function toggleStar(id: string) {
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const q = query.toLowerCase();

  const agents = useMemo(
    () => ALL_AGENTS.filter((a) => a.name.toLowerCase().includes(q) || a.team.toLowerCase().includes(q)),
    [q]
  );
  const skills = useMemo(
    () => ALL_SKILLS.filter((s) => s.name.toLowerCase().includes(q)),
    [q]
  );
  const teams = useMemo(
    () => ALL_TEAMS.filter((t) => t.name.toLowerCase().includes(q)),
    [q]
  );

  const isFavorites = filter === "favorites";
  const isDynamic   = filter === "dynamic";
  const showAgents  = filter === "all" || filter === "agents" || isFavorites || isDynamic;
  const showSkills  = filter === "all" || filter === "skills" || isFavorites;
  const showTeams   = filter === "all" || filter === "teams"  || isFavorites;

  const visibleAgents = isFavorites
    ? agents.filter((a) => starred.has(a.id))
    : isDynamic
    ? agents.filter((a) => a.status === "available" || a.status === "busy")
    : agents;
  const visibleSkills = isFavorites ? skills.filter((s) => starred.has(s.id)) : skills;
  const visibleTeams  = isFavorites ? teams.filter((t)  => starred.has(t.id))  : teams;

  return (
    <div className={cn(CARD, className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
        <BookUser className="w-4 h-4 text-[#005C99]" />
        <span className="text-[15px] font-semibold text-[#333]">Directory</span>
      </div>

      {/* Search + filter */}
      <div className="px-4 pb-3 flex flex-col gap-2 shrink-0 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for people, skills, teams, dial in a number to call, etc."
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
            <SelectItem value="agents">Agents</SelectItem>
            <SelectItem value="skills">Skills</SelectItem>
            <SelectItem value="teams">Teams</SelectItem>
            <SelectItem value="dynamic">Dynamic people</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-2">

        {/* Agents */}
        {showAgents && visibleAgents.length > 0 && (
          <div className="mb-2">
            <SectionHeader
              title={isDynamic ? "Dynamic people" : "Agents"}
              icon={<UserCircle2 className="w-4 h-4 text-[#005C99]" />}
            />
            <div className="flex flex-col divide-y divide-border">
              {visibleAgents.slice(0, agentLimit).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between py-2.5 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#ECF3F8] flex items-center justify-center shrink-0 text-[#005C99] text-xs font-semibold">
                      {agent.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                      <div className="flex items-center gap-1">
                        <StatusIndicator status={agent.status} />
                        <StatusLabel status={agent.status} />
                      </div>
                    </div>
                  </div>
                  <StarButton starred={starred.has(agent.id)} onToggle={() => toggleStar(agent.id)} />
                </div>
              ))}
            </div>
            {visibleAgents.length > agentLimit && (
              <LoadMore onClick={() => setAgentLimit((n) => n + PREVIEW_COUNT)} />
            )}
          </div>
        )}

        {/* Skills */}
        {showSkills && visibleSkills.length > 0 && (
          <div className="mb-2">
            <SectionHeader
              title="Skills"
              icon={<Wrench className="w-4 h-4 text-[#005C99]" />}
            />
            <div className="flex flex-col divide-y divide-border">
              {visibleSkills.slice(0, skillLimit).map((skill) => (
                <div key={skill.id} className="flex items-center justify-between py-2.5 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate mb-1">{skill.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={skill.available ? "secondary" : "destructive"}>
                        {skill.available ? <CheckCircle2 /> : <MinusCircle />}
                        {skill.available ? "Available" : "Unavailable"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Queue: <span className="font-medium text-foreground">{skill.queue}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Wait: <span className="font-medium text-foreground">{skill.waitMin} min</span>
                      </span>
                    </div>
                  </div>
                  <StarButton starred={starred.has(skill.id)} onToggle={() => toggleStar(skill.id)} />
                </div>
              ))}
            </div>
            {visibleSkills.length > skillLimit && (
              <LoadMore onClick={() => setSkillLimit((n) => n + PREVIEW_COUNT)} />
            )}
          </div>
        )}

        {/* Teams */}
        {showTeams && visibleTeams.length > 0 && (
          <div className="mb-2">
            <SectionHeader
              title="Teams"
              icon={<Users className="w-4 h-4 text-[#005C99]" />}
            />
            <div className="flex flex-col divide-y divide-border">
              {visibleTeams.slice(0, teamLimit).map((team) => (
                <div key={team.id} className="flex items-center justify-between py-2.5 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#ECF3F8] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#005C99]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.members} members</p>
                    </div>
                  </div>
                  <StarButton starred={starred.has(team.id)} onToggle={() => toggleStar(team.id)} />
                </div>
              ))}
            </div>
            {visibleTeams.length > teamLimit && (
              <LoadMore onClick={() => setTeamLimit((n) => n + PREVIEW_COUNT)} />
            )}
          </div>
        )}

        {/* Empty state */}
        {!agents.length && !skills.length && !teams.length && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <Search className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No results for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
