import type { SupportConversation, CannedResponse } from "../types/support";

export const mockCannedResponses: CannedResponse[] = [
  { id: "CAN-001", title: "Investigating", content: "Thank you for contacting Atlas Support. We are investigating your issue and will update you shortly." },
  { id: "CAN-002", title: "Resolved", content: "Your issue has been resolved. Please let us know if you need further assistance." },
  { id: "CAN-003", title: "Follow-up", content: "Could you please provide more details so we can assist you better?" },
];

export const mockSupportConversations: SupportConversation[] = [
  {
    id: "SUP-1001",
    userType: "customer",
    userId: "CUST-001",
    userName: "Ama Serwaa",
    channel: "live_chat",
    subject: "Data bundle not delivered",
    status: "open",
    priority: "high",
    assignee: "support@atlas.com",
    lastMessageAt: new Date(Date.now() - 300000).toISOString(),
    unreadCount: 2,
    messages: [
      {
        id: "MSG-1",
        sender: "user",
        content: "Hello, I bought MTN data but it hasn't reflected.",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        readByAdmin: true,
      },
      {
        id: "MSG-2",
        sender: "admin",
        content: "Let me check your order. One moment please.",
        timestamp: new Date(Date.now() - 500000).toISOString(),
        readByAdmin: true,
      },
      {
        id: "MSG-3",
        sender: "user",
        content: "Okay, thank you. I have attached my payment receipt.",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        readByAdmin: false,
        attachments: [{ id: "ATT-1", fileName: "receipt.pdf", type: "pdf", size: 245000 }],
      },
    ],
    internalNotes: [
      { id: "NOTE-1001", admin: "support@atlas.com", content: "Customer called earlier, urgent", timestamp: new Date(Date.now() - 480000).toISOString() },
    ],
  },
  {
    id: "SUP-1002",
    userType: "reseller",
    userId: "RS-001",
    userName: "Kwame Store",
    channel: "ticket",
    subject: "Commission not credited",
    status: "pending",
    priority: "medium",
    assignee: "finance@atlas.com",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1,
    messages: [
      {
        id: "MSG-4",
        sender: "user",
        content: "I have not received commission for order ATX-983821",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        readByAdmin: false,
      },
    ],
    internalNotes: [],
  },
  {
    id: "SUP-1003",
    userType: "merchant",
    userId: "MER-001",
    userName: "TechHub Store",
    channel: "live_chat",
    subject: "Storefront template issue",
    status: "resolved",
    priority: "high",
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: "MSG-5",
        sender: "user",
        content: "My storefront is blank after changing template.",
        timestamp: new Date(Date.now() - 90000000).toISOString(),
        readByAdmin: true,
      },
      {
        id: "MSG-6",
        sender: "admin",
        content: "We fixed the issue. Please clear cache and check.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        readByAdmin: true,
      },
    ],
    internalNotes: [
      { id: "NOTE-1002", admin: "support@atlas.com", content: "Fixed by template team", timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
];