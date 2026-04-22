export type Channel = "webchat" | "phone" | "email" | "facebook" | "sms" | "twitter";
export type ContactStatus = "active" | "waiting" | "hold";

export interface ContactBadge {
  label: string;
  /** "default" = outline only; "green" = light green bg + green border; "red" = light red bg + red border */
  type: "default" | "green" | "red";
}

export interface CustomerProfile {
  initials: string;
  accountType: string;
  tenureYears: number;
  balance: string;
  fraudRiskScore: number;
  priorDisputes: number;
  cardBlocked: boolean;
  badges: ContactBadge[];
  contextSummary: string;
}

export interface Contact {
  id: string;
  name: string;
  queue: string;
  channel: Channel;
  duration: string;
  status: ContactStatus;
  unread: boolean;
  caseNumber: string;
  profile: CustomerProfile;
}

export type MessageRole = "agent" | "customer";

export interface Message {
  id: string;
  sender: string;
  role: MessageRole;
  text: string;
  timestamp: string;
}

export const mockContacts: Contact[] = [
  {
    id: "sarah-mitchell",
    name: "Sarah Mitchell",
    queue: "Customer Support",
    channel: "webchat",
    duration: "15 min",
    status: "active",
    unread: false,
    caseNumber: "22073579",
    profile: {
      initials: "SM",
      accountType: "Personal Banking",
      tenureYears: 3,
      balance: "$8,420.50",
      fraudRiskScore: 71,
      priorDisputes: 2,
      cardBlocked: true,
      badges: [
        { label: "Premier", type: "default" },
        { label: "Card Blocked", type: "red" },
      ],
      contextSummary:
        "3-year Premier client. Card currently blocked due to suspected fraudulent charges. Two prior disputes on record. Sentiment: Worried and seeking reassurance.",
    },
  },
  {
    id: "maggie-wilson",
    name: "Maggie Wilson",
    queue: "Customer Support",
    channel: "facebook",
    duration: "15 min",
    status: "waiting",
    unread: true,
    caseNumber: "22073580",
    profile: {
      initials: "MW",
      accountType: "Personal Banking",
      tenureYears: 2,
      balance: "$3,150.75",
      fraudRiskScore: 28,
      priorDisputes: 0,
      cardBlocked: false,
      badges: [
        { label: "Standard", type: "default" },
      ],
      contextSummary:
        "2-year client with a clean dispute history and account in good standing. Inquiring about a statement discrepancy. Sentiment: Curious and cooperative.",
    },
  },
  {
    id: "peter-brier",
    name: "Peter Brier",
    queue: "Sales Support",
    channel: "email",
    duration: "2 hr",
    status: "waiting",
    unread: false,
    caseNumber: "22073581",
    profile: {
      initials: "PB",
      accountType: "Business Banking",
      tenureYears: 7,
      balance: "$245,000.00",
      fraudRiskScore: 12,
      priorDisputes: 1,
      cardBlocked: false,
      badges: [
        { label: "Enterprise", type: "default" },
        { label: "IVR Auth ✓", type: "green" },
      ],
      contextSummary:
        "Long-standing business client (7 years). Interested in a plan upgrade. Account in excellent standing with strong payment history. Sentiment: Professional and motivated.",
    },
  },
];

export const mockMessages: Record<string, Message[]> = {
  "sarah-mitchell": [
    {
      id: "m1",
      sender: "Sarah Mitchell",
      role: "customer",
      text: "Hi, I just got an alert about charges on my account that I didn't make. I'm really worried — what's happening?",
      timestamp: "10:02 AM",
    },
    {
      id: "m2",
      sender: "Agent Smith",
      role: "agent",
      text: "Hi Sarah, I'm so glad you called right away — that was absolutely the right thing to do. I can already see what's happened and I want to take action immediately. I'm blocking your card right now to prevent any further charges, and I'm opening a dispute for both transactions. You'll receive a provisional credit of $341.99 within one business day while we investigate.",
      timestamp: "10:03 AM",
    },
    {
      id: "m3",
      sender: "Sarah Mitchell",
      role: "customer",
      text: "Thank you — will I get a new card quickly? I need it for grocery shopping this week.",
      timestamp: "10:04 AM",
    },
    {
      id: "m4",
      sender: "Agent Smith",
      role: "agent",
      text: "Is your address still – 1 AT&T Way, Arlington, TX 76001?",
      timestamp: "10:05 AM",
    },
    {
      id: "m5",
      sender: "Sarah Mitchell",
      role: "customer",
      text: "Sure is – except the zip code is incorrect. It should be 76011.",
      timestamp: "10:05 AM",
    },
    {
      id: "m6",
      sender: "Agent Smith",
      role: "agent",
      text: "Absolutely. As a Premier member you qualify for complimentary expedited delivery — your new card will arrive in one to two business days. I'd also like to enroll you in real-time transaction alerts so you're notified instantly of any future charges. Would that be helpful?",
      timestamp: "10:06 AM",
    },
    {
      id: "m7",
      sender: "Sarah Mitchell",
      role: "customer",
      text: "Yes please, that would be great. Thank you so much — I feel so much better.",
      timestamp: "10:07 AM",
    },
    {
      id: "m8",
      sender: "Agent Smith",
      role: "agent",
      text: "Great. Can I help you with anything else?",
      timestamp: "10:07 AM",
    },
    {
      id: "m9",
      sender: "Sarah Mitchell",
      role: "customer",
      text: "That's it, thanks.",
      timestamp: "10:08 AM",
    },
    {
      id: "m10",
      sender: "Agent Smith",
      role: "agent",
      text: "Please stay on the call for a quick survey on how I performed and would love a 5 of 5.",
      timestamp: "10:08 AM",
    },
  ],
  "maggie-wilson": [
    {
      id: "m1",
      sender: "Maggie Wilson",
      role: "customer",
      text: "Hi, I have a question about my account statement.",
      timestamp: "9:45 AM",
    },
    {
      id: "m2",
      sender: "Agent Smith",
      role: "agent",
      text: "Hi Maggie! I'd be happy to help. What's your question?",
      timestamp: "9:46 AM",
    },
  ],
  "peter-brier": [
    {
      id: "m1",
      sender: "Peter Brier",
      role: "customer",
      text: "Hello, I'm interested in upgrading my plan.",
      timestamp: "8:30 AM",
    },
    {
      id: "m2",
      sender: "Agent Smith",
      role: "agent",
      text: "Hi Peter! Great to hear from you. Let me pull up your account details.",
      timestamp: "8:32 AM",
    },
  ],
};

export const customerSentimentData = {
  sentiment: "negative" as const,
  summary: "Sarah is worried about the fraudulent charge on her card.",
  score: 2,
};

export const agentName = "Agent Smith";
export const agentInitials = "SE";
export const agentStatus = "Unavailable";
export const agentTimer = "00:21";
