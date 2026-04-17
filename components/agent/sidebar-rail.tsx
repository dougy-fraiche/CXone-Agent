import { useState } from "react";
import {
  History,
  Search,
  LayoutList,
  BookUser,
  CalendarDays,
  CircleUser,
  Settings,
  ChartColumnBig,
  Ellipsis,
  GripVertical,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  enabled: boolean;
}

const DEFAULT_ITEMS: NavItem[] = [
  { id: "history",   icon: History,      label: "Contact History", enabled: true },
  { id: "search",    icon: Search,       label: "Search",          enabled: true },
  { id: "queue",     icon: LayoutList,   label: "Queue",           enabled: true },
  { id: "directory", icon: BookUser,     label: "Directory",       enabled: true },
  { id: "schedule",  icon: CalendarDays, label: "Schedule",        enabled: true },
  { id: "wem",       icon: CircleUser,   label: "WEM",             enabled: true },
];

const BOTTOM_ITEMS = [
  { id: "settings",  icon: Settings,       label: "Settings"  },
  { id: "reporting", icon: ChartColumnBig, label: "Reporting" },
];

interface AgentSidebarRailProps {
  activeNavId: string | null;
  onNavSelect: (id: string | null) => void;
}

export function AgentSidebarRail({ activeNavId, onNavSelect }: AgentSidebarRailProps) {
  const [items, setItems] = useState<NavItem[]>(DEFAULT_ITEMS);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i))
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIdx = prev.findIndex((i) => i.id === active.id);
        const newIdx = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  }

  const visibleItems = items.filter((i) => i.enabled);

  return (
    <TooltipProvider delayDuration={300}>
      {/* Single top-aligned column — Settings/Reporting/More flow directly below WEM */}
      <div className="flex flex-col pt-2 px-2 gap-0">
        {/* Customizable nav items */}
        {visibleItems.map((item) => (
          <RailItem
            key={item.id}
            item={item}
            isActive={activeNavId === item.id}
            onClick={() => onNavSelect(activeNavId === item.id ? null : item.id)}
          />
        ))}

        {/* Settings + Reporting — immediately after last visible item */}
        {BOTTOM_ITEMS.map((item) => (
          <RailItem
            key={item.id}
            item={{ ...item, enabled: true }}
            isActive={activeNavId === item.id}
            onClick={() => onNavSelect(activeNavId === item.id ? null : item.id)}
          />
        ))}

        {/* More — opens customize popover */}
        <Popover>
          <PopoverTrigger
            title="More"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "size-9 p-0"
            )}
          >
            <Ellipsis className="w-5 h-5 shrink-0" />
            <span className="sr-only">More</span>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            sideOffset={8}
            align="start"
            className="w-64 p-0 overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center px-4 py-3 border-b border-[#D2D8DB]">
              <span className="font-bold text-[15px] text-[#191919]">
                Customize
              </span>
            </div>

            {/* Sortable item list */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="overflow-y-auto max-h-80 py-1">
                  {items.map((item) => (
                    <SortableCustomizeItem
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}

function SortableCustomizeItem({
  item,
  onToggle,
}: {
  item: NavItem;
  onToggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 select-none",
        isDragging && "opacity-50 bg-[#ECF3F8] rounded"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-[#C3C5C9] hover:text-[#526b7a] transition-colors touch-none shrink-0"
        {...attributes}
        {...listeners}
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span
        className={cn(
          "flex-1 text-[13px] leading-snug",
          item.enabled
            ? "font-semibold text-[#191919]"
            : "font-normal text-[#9AA5AB]"
        )}
      >
        {item.label}
      </span>

      <Switch
        checked={item.enabled}
        onCheckedChange={() => onToggle(item.id)}
        className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
      />
    </div>
  );
}

function RailItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0",
          isActive && "bg-muted text-foreground"
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="sr-only">{item.label}</span>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
