
import { UserPlus, UserMinus, AlignJustify } from "lucide-react";
import { ContactTile } from "./contact-tile";
import type { Contact } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AssignmentPanelProps {
  contacts: Contact[];
  activeContactId: string | null;
  onContactSelect: (id: string) => void;
  onTransfer?: () => void;
  className?: string;
}

export function AssignmentPanel({
  contacts,
  activeContactId,
  onContactSelect,
  onTransfer,
  className,
}: AssignmentPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-y border-l border-[#D2D8DB] rounded-l-lg shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-[#D2D8DB] shrink-0">
        <div className="flex items-center gap-1">
          <button className="p-1 rounded border border-[#B0CDDB] bg-white hover:bg-[#ECF3F8] transition-colors" title="Accept contact">
            <UserPlus className="w-3.5 h-3.5 text-[#526b7a]" />
          </button>
          <button className="p-1 rounded border border-[#B0CDDB] bg-white hover:bg-[#ECF3F8] transition-colors" title="Decline contact">
            <UserMinus className="w-3.5 h-3.5 text-[#526b7a]" />
          </button>
        </div>
        <button className="p-1 rounded hover:bg-[#ECF3F8] transition-colors" title="Menu">
          <AlignJustify className="w-4 h-4 text-[#526b7a]" />
        </button>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1.5 p-1.5">
          {[...contacts].sort((a, b) => (a.channel === "phone" ? -1 : b.channel === "phone" ? 1 : 0)).map((contact) => (
            <ContactTile
              key={contact.id}
              contact={contact}
              isActive={contact.id === activeContactId}
              onClick={() => onContactSelect(contact.id)}
              onTransfer={contact.channel === "phone" ? onTransfer : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
