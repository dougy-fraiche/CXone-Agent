import { LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col h-full bg-white border border-[#D2D8DB] rounded-lg shadow-sm overflow-hidden";

export function QueuePage({ className }: { className?: string }) {
  return (
    <div className={cn(CARD, className)}>
      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
        <LayoutList className="w-4 h-4 text-[#005C99]" />
        <span className="text-[15px] font-semibold text-[#333]">Queue</span>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-8">
        <LayoutList className="w-10 h-10 text-[#D2D8DB]" />
        <p className="text-[13px] font-semibold text-[#333]">Queue</p>
        <p className="text-[12px] text-[#526b7a] max-w-xs">Manage and monitor your incoming contact queue.</p>
        <span className="text-[11px] text-[#8fa3b1] border border-[#D2D8DB] rounded px-2 py-0.5">Coming soon</span>
      </div>
    </div>
  );
}
