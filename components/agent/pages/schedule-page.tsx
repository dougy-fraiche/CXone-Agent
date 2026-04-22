"use client";

import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Coffee,
  Users,
  UtensilsCrossed,
  PhoneCall,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CARD =
  "flex flex-col h-full bg-white border border-[#D2D8DB] rounded-lg shadow-sm overflow-hidden";

const HOUR_HEIGHT = 64; // px per hour
const START_HOUR = 7;   // 7 AM
const END_HOUR = 20;    // 8 PM

type ViewMode = "day" | "week";

interface ScheduleEvent {
  id: string;
  title: string;
  subtitle?: string;
  startHour: number; // decimal hours, e.g. 8.5 = 8:30 AM
  endHour: number;
  colorClass: string;
  icon: React.ReactNode;
}

const MOCK_EVENTS: ScheduleEvent[] = [
  {
    id: "shift-start",
    title: "Shift Start",
    startHour: 8,
    endHour: 8,
    colorClass: "bg-slate-100 border-slate-300 text-slate-700",
    icon: <Clock className="w-3 h-3" />,
  },
  {
    id: "available-1",
    title: "Available",
    subtitle: "Customer Support Queue",
    startHour: 8,
    endHour: 10,
    colorClass: "bg-green-50 border-green-300 text-green-800",
    icon: <PhoneCall className="w-3 h-3" />,
  },
  {
    id: "standup",
    title: "Morning Standup",
    subtitle: "Team meeting · Conference Room B",
    startHour: 10,
    endHour: 10.5,
    colorClass: "bg-blue-50 border-blue-300 text-blue-800",
    icon: <Users className="w-3 h-3" />,
  },
  {
    id: "available-2",
    title: "Available",
    subtitle: "Customer Support Queue",
    startHour: 10.5,
    endHour: 12,
    colorClass: "bg-green-50 border-green-300 text-green-800",
    icon: <PhoneCall className="w-3 h-3" />,
  },
  {
    id: "lunch",
    title: "Lunch Break",
    startHour: 12,
    endHour: 13,
    colorClass: "bg-orange-50 border-orange-300 text-orange-800",
    icon: <UtensilsCrossed className="w-3 h-3" />,
  },
  {
    id: "available-3",
    title: "Available",
    subtitle: "Customer Support Queue",
    startHour: 13,
    endHour: 14.5,
    colorClass: "bg-green-50 border-green-300 text-green-800",
    icon: <PhoneCall className="w-3 h-3" />,
  },
  {
    id: "break",
    title: "Break",
    startHour: 14.5,
    endHour: 14.75,
    colorClass: "bg-purple-50 border-purple-300 text-purple-800",
    icon: <Coffee className="w-3 h-3" />,
  },
  {
    id: "available-4",
    title: "Available",
    subtitle: "Customer Support Queue",
    startHour: 14.75,
    endHour: 17,
    colorClass: "bg-green-50 border-green-300 text-green-800",
    icon: <PhoneCall className="w-3 h-3" />,
  },
];

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display} ${suffix}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
  });
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function CurrentTimeLine({ startHour }: { startHour: number }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const currentDecimal =
    now.getHours() + now.getMinutes() / 60;
  if (currentDecimal < startHour || currentDecimal > END_HOUR) return null;

  const top = (currentDecimal - startHour) * HOUR_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
      style={{ top }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 -ml-1.5" />
      <div className="flex-1 h-px bg-primary" />
    </div>
  );
}

function DayView({ date, isToday }: { date: Date; isToday: boolean }) {
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="flex flex-col min-w-0">
      {/* Day + Shift header */}
      <div className="border-b border-border px-4 py-2 shrink-0">
        <p className="text-sm font-medium text-foreground">
          {formatDayHeader(date).replace("/", " ")}
        </p>
      </div>
      <div className="border-b border-border px-4 py-1 shrink-0">
        <p className="text-xs text-muted-foreground">Shift</p>
      </div>

      {/* Time grid */}
      <div className="relative flex-1 overflow-y-auto">
        <div
          className="relative"
          style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
        >
          {/* Hour rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-b border-border/50"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            >
              <span className="absolute -top-2.5 left-3 text-[11px] text-muted-foreground select-none">
                {formatHour(hour)}
              </span>
            </div>
          ))}

          {/* Events */}
          <div className="absolute inset-0 ml-16 mr-3">
            {MOCK_EVENTS.map((event) => {
              const top = (event.startHour - START_HOUR) * HOUR_HEIGHT;
              const height = Math.max(
                (event.endHour - event.startHour) * HOUR_HEIGHT,
                24
              );
              const isShort = height < 36;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-0 right-0 rounded border px-2 py-1 overflow-hidden cursor-pointer hover:brightness-95 transition-all",
                    event.colorClass
                  )}
                  style={{ top, height }}
                >
                  <div className={cn("flex items-center gap-1", isShort ? "flex-row" : "flex-col items-start")}>
                    <div className="flex items-center gap-1 shrink-0">
                      {event.icon}
                      <span className="text-[11px] font-semibold leading-tight truncate">
                        {event.title}
                      </span>
                    </div>
                    {!isShort && event.subtitle && (
                      <span className="text-[10px] opacity-75 truncate w-full">
                        {event.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current time indicator */}
          {isToday && (
            <div className="absolute ml-14 right-3 inset-y-0 pointer-events-none">
              <CurrentTimeLine startHour={START_HOUR} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SchedulePage({ className }: { className?: string }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const isToday = isSameDay(selectedDate, today);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  return (
    <div className={cn(CARD, className)}>
      {/* Page heading */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
        <CalendarDays className="w-4 h-4 text-[#005C99]" />
        <span className="text-[15px] font-semibold text-[#333]">Schedule</span>
      </div>

      {/* Tab bar */}
      <div className="flex items-end px-4 border-b border-border shrink-0">
        <button className="relative px-4 py-2.5 text-[13px] font-medium text-[#005C99]">
          My Schedule
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#005C99] rounded-t-sm" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        {/* Prev / Date / Next */}
        <div className="flex items-center border border-border rounded-md overflow-hidden shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none h-8 w-8 border-r border-border"
            onClick={() => setSelectedDate((d) => addDays(d, viewMode === "day" ? -1 : -7))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="px-4 text-sm text-foreground min-w-[160px] text-center hover:bg-muted/50 transition-colors h-8">
                {viewMode === "day"
                  ? formatDate(selectedDate)
                  : `${formatDate(weekDays[0])} – ${formatDate(weekDays[6])}`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none h-8 w-8 border-l border-border"
            onClick={() => setSelectedDate((d) => addDays(d, viewMode === "day" ? 1 : 7))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Today */}
        <Button
          variant="outline"
          size="sm"
          className={cn(isToday && "border-primary text-primary")}
          onClick={() => setSelectedDate(today)}
        >
          <CircleDot className="w-3.5 h-3.5" />
          Today
        </Button>

        {/* Day / Week toggle */}
        <div className="flex items-center border border-border rounded-md overflow-hidden ml-auto">
          {(["day", "week"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1.5 text-sm capitalize transition-colors",
                viewMode === mode
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "day" ? (
          <DayView date={selectedDate} isToday={isToday} />
        ) : (
          <div className="flex h-full overflow-x-auto">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="flex-1 min-w-[120px] border-r border-border last:border-r-0 flex flex-col"
              >
                <div
                  className={cn(
                    "px-2 py-2 text-center border-b border-border shrink-0",
                    isSameDay(day, today) && "text-primary font-semibold"
                  )}
                >
                  <p className="text-xs text-muted-foreground">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p className={cn("text-sm font-medium", isSameDay(day, today) && "text-primary")}>
                    {day.getDate()}
                  </p>
                </div>
                <div className="flex-1 relative overflow-y-auto">
                  <div style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }} className="relative">
                    {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 border-b border-border/50"
                        style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                      />
                    ))}
                    {isSameDay(day, today) && (
                      <CurrentTimeLine startHour={START_HOUR} />
                    )}
                    {isSameDay(day, selectedDate) && (
                      <div className="absolute inset-0 mx-1">
                        {MOCK_EVENTS.map((event) => {
                          const top = (event.startHour - START_HOUR) * HOUR_HEIGHT;
                          const height = Math.max((event.endHour - event.startHour) * HOUR_HEIGHT, 20);
                          return (
                            <div
                              key={event.id}
                              className={cn("absolute left-0 right-0 rounded border px-1 py-0.5 overflow-hidden text-[10px] font-medium", event.colorClass)}
                              style={{ top, height }}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
