
import { ChannelTabBar } from "./channel-tab-bar";
import { SubjectLine } from "./subject-line";
import { MessageThread } from "./message-thread";
import { ReplyBox } from "./reply-box";
import { EmailThread } from "./email-thread";
import { EmailReplyBox } from "./email-reply-box";
import { cn } from "@/lib/utils";
import type { Contact, Message } from "@/lib/mock-data";

interface InteractionSpaceProps {
  contact: Contact;
  messages: Message[];
  onSend: (text: string) => void;
  className?: string;
}

export function InteractionSpace({
  contact,
  messages,
  onSend,
  className,
}: InteractionSpaceProps) {
  const isEmail = contact.channel === "email";

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border border-[#D2D8DB] rounded-r-lg shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Channel tabs header */}
      <ChannelTabBar contact={contact} />

      {/* Subject / case line */}
      <SubjectLine contact={contact} />

      {isEmail ? (
        <>
          {/* Email thread — scrollable */}
          <EmailThread
            messages={messages}
            contact={contact}
            className="flex-1 min-h-0"
          />

          {/* Email reply composer */}
          <div className="border-t border-[#D2D8DB] pt-3 bg-white shrink-0">
            <EmailReplyBox contact={contact} onSend={onSend} />
          </div>
        </>
      ) : (
        <>
          {/* Chat message thread — grows to fill */}
          <MessageThread messages={messages} className="bg-white" />

          {/* Chat reply box */}
          <ReplyBox onSend={onSend} contact={contact} />
        </>
      )}
    </div>
  );
}
