import type { EcommerceSupportTicket } from "../types/ecommerce-support";

export const mockEcommerceSupportTickets: EcommerceSupportTicket[] = [
  {
    id: "TKT-2001",
    merchantId: "MER-001",
    merchantName: "TechHub Store",
    subject: "Storefront template not loading correctly",
    category: "storefront",
    status: "open",
    priority: "high",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    messages: [
      { id: "MSG-1", sender: "merchant", message: "My storefront is showing a blank page after selecting template 2.", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "MSG-2", sender: "admin", message: "We are investigating the issue. Could you try clearing your cache?", timestamp: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
  {
    id: "TKT-2002",
    merchantId: "MER-002",
    merchantName: "FashionPlus",
    subject: "Billing charge incorrect",
    category: "billing",
    status: "pending",
    priority: "medium",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    messages: [],
  },
  {
    id: "TKT-2003",
    merchantId: "MER-003",
    merchantName: "HomeEssentials",
    subject: "Unable to add new product",
    category: "technical",
    status: "open",
    priority: "urgent",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    messages: [],
  },
];