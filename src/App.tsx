import { useEffect, useRef, useState } from "react";
import { TopNav } from "@/components/agent/top-nav";
import { AgentSidebarRail } from "@/components/agent/sidebar-rail";
import { AssignmentPanel } from "@/components/agent/assignment-panel";
import { InteractionSpace } from "@/components/agent/interaction-space";
import { AppSpace } from "@/components/agent/app-space";
import { NavRouter } from "@/components/agent/pages";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { mockContacts, mockMessages } from "@/lib/mock-data";
import { AgentStatusProvider } from "@/lib/agent-status-context";
import type { Message } from "@/lib/mock-data";
import type { ImperativePanelHandle } from "react-resizable-panels";

const APP_SPACE_DEFAULT_PX = 360;
const PANEL_PADDING_PX = 32; // p-4 on both sides (16px × 2)
const HANDLE_WIDTH_PX = 8;   // gap between panels

export default function App() {
  const [activeContactId, setActiveContactId] = useState<string | null>("sarah-mitchell");
  const [activeNavId, setActiveNavId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const panelContainerRef = useRef<HTMLDivElement>(null);
  const appPanelRef = useRef<ImperativePanelHandle>(null);
  /** Tracks the user's chosen pixel width for the app space panel. */
  const appSpacePxRef = useRef(APP_SPACE_DEFAULT_PX);
  /** Set to true before a programmatic resize so onLayout ignores it. */
  const skipLayoutUpdateRef = useRef(false);

  const activeContact = activeContactId
    ? mockContacts.find((c) => c.id === activeContactId) ?? null
    : null;

  const activeMessages = activeContactId ? (messages[activeContactId] ?? []) : [];

  /** Convert a pixel width to a percentage of the available panel group width. */
  function calcPctFromPx(px: number): number {
    const containerWidth = panelContainerRef.current?.getBoundingClientRect().width ?? 0;
    if (!containerWidth) return 38; // fallback before layout
    const available = containerWidth - PANEL_PADDING_PX - HANDLE_WIDTH_PX;
    return Math.round((px / available) * 1000) / 10; // 1 decimal place
  }

  /** Apply the stored pixel width as a percentage. */
  function applyStoredPx() {
    skipLayoutUpdateRef.current = true;
    appPanelRef.current?.resize(calcPctFromPx(appSpacePxRef.current));
    requestAnimationFrame(() => { skipLayoutUpdateRef.current = false; });
  }

  // On mount: set the panel to the default pixel width once layout is ready.
  useEffect(() => {
    const id = setTimeout(applyStoredPx, 0);
    return () => clearTimeout(id);
  }, []);

  // When the container changes size (window resize), reapply the stored pixel width.
  useEffect(() => {
    const el = panelContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(applyStoredPx);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /** Called by ResizablePanelGroup whenever the layout changes. */
  function handleLayout(sizes: number[]) {
    if (skipLayoutUpdateRef.current) return;
    // User dragged the handle — record the new pixel width of the app panel.
    const containerWidth = panelContainerRef.current?.getBoundingClientRect().width ?? 0;
    if (!containerWidth) return;
    const available = containerWidth - PANEL_PADDING_PX - HANDLE_WIDTH_PX;
    appSpacePxRef.current = Math.round((sizes[1] / 100) * available);
  }

  function resetPanelLayout() {
    appSpacePxRef.current = APP_SPACE_DEFAULT_PX;
    applyStoredPx();
  }

  function handleNavSelect(id: string | null) {
    setActiveNavId(id);
    if (id !== null) setActiveContactId(null);
  }

  function handleContactSelect(id: string) {
    setActiveContactId(id);
    setActiveNavId(null);
  }

  function handleSend(text: string) {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: "Agent Smith",
      role: "agent",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    if (!activeContactId) return;
    setMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] ?? []), newMessage],
    }));
  }

  return (
    <AgentStatusProvider>
    <div className="flex flex-col w-full h-screen bg-[#F5F8FA] overflow-hidden">
      {/* Top navigation — full width */}
      <TopNav />

      {/* Body row — fills remaining height, never wraps */}
      <div className="flex flex-1 min-w-0 overflow-hidden">

        {/* Icon rail — fixed 52px, never shrinks */}
        <div className="relative w-[52px] shrink-0 bg-[#f6f7f9]">
          <AgentSidebarRail activeNavId={activeNavId} onNavSelect={handleNavSelect} />
        </div>

        {/* Assignment panel — fixed 232px */}
        <div className="w-[232px] shrink-0 overflow-hidden py-4 pl-4">
          <AssignmentPanel
            contacts={mockContacts}
            activeContactId={activeContactId}
            onContactSelect={handleContactSelect}
            className="h-full"
          />
        </div>

        {/* Main content: nav page OR resizable panels */}
        <div ref={panelContainerRef} className="flex-1 min-w-0 overflow-hidden py-4 pr-4">
          {activeNavId ? (
            <NavRouter navId={activeNavId} className="h-full" />
          ) : activeContact ? (
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full"
              onLayout={handleLayout}
            >
              <ResizablePanel minSize={25}>
                <InteractionSpace
                  key={activeContact.id}
                  contact={activeContact}
                  messages={activeMessages}
                  onSend={handleSend}
                  className="h-full"
                />
              </ResizablePanel>

              <ResizableHandle
                withHandle
                onDoubleClick={resetPanelLayout}
              />

              <ResizablePanel
                ref={appPanelRef}
                defaultSize={38}
                minSize={15}
              >
                <AppSpace key={activeContact.id} contact={activeContact} className="h-full" />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : null}
        </div>
      </div>
    </div>
    </AgentStatusProvider>
  );
}
