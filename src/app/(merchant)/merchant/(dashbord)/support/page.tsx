/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { cn } from "@/lib/utils";
import { SupportChatPanel } from "@/components/merchant/support-chat-panel";

const supportCategories = [
  "Orders",
  "Payments",
  "Products",
  "Storefront",
  "Billing",
  "Account",
  "Other",
];

const mockSupportTickets = [
  {
    id: "ticket1",
    subject: "Payment not reflecting in wallet",
    category: "Payments",
    status: "Open",
    date: "Aug 21, 2025",
  },
  {
    id: "ticket2",
    subject: "Storefront images not loading",
    category: "Storefront",
    status: "Resolved",
    date: "Aug 18, 2025",
  },
];

const helpArticles = [
  {
    id: "article1",
    title: "How to add a product",
    content:
      "Go to Products → Add Product. Fill in the product name, description, price, and upload an image. The system will generate an SKU automatically. You can also set the stock quantity and status (Active or Draft).",
  },
  {
    id: "article2",
    title: "How to customize your store",
    content:
      "Navigate to Storefront in the sidebar. In the Branding tab, you can change your store name, tagline, logo, hero title, and description. In the Appearance tab, choose a theme and adjust primary and accent colors. Save your changes to see them live.",
  },
  {
    id: "article3",
    title: "How to process orders",
    content:
      "Go to Orders. New orders appear in the 'New Orders' card. Click on an order to view details. You can update the order status using the dropdown (Processing, Shipped, Delivered, etc.). The order will move to the 'Updated Orders' card once the status changes.",
  },
  {
    id: "article4",
    title: "How to manage customers",
    content:
      "In the Customers page, you can view all customers who have registered or placed orders. Use the search and status filters to find specific customers. Click on a customer to view their order history, total spent, and contact information. You can email or call them directly from the detail page.",
  },
  {
    id: "article5",
    title: "How to change your subscription",
    content:
      "Go to Billing & Plan. There you'll see the four plan options: Starter, Growth, Pro, and Enterprise. Select a plan and billing cycle (monthly or annual). Click 'Switch Plan' and complete the payment to upgrade. Your new plan features will activate immediately.",
  },
  {
    id: "article6",
    title: "How to enable Cash on Delivery",
    content:
      "Open Storefront → Settings. Scroll down to the 'Cash on Delivery' toggle and turn it on. Save your changes. Customers will now see the Cash on Delivery option at checkout, allowing them to pay when the order is delivered.",
  },
];

export default function MerchantSupportPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  const filteredArticles = helpArticles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleArticle = (articleId: string) => {
    setOpenArticleId((prev) => (prev === articleId ? null : articleId));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Support
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Get help with your store.
        </p>
      </div>

      {/* Help articles with search */}
      <div id="help-articles" className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Help Articles</h2>
            <p className="text-sm text-neutral-500">Frequently asked questions and guides</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 pl-10 text-sm"
            />
            <AtlasIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredArticles.length === 0 ? (
            <p className="text-sm text-neutral-500">No articles found.</p>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleArticle(article.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {article.title}
                  </span>
                  <AtlasIcon
                    name={openArticleId === article.id ? "arrow-up" : "arrow-down"}
                    className="h-4 w-4 text-neutral-400"
                  />
                </button>
                {openArticleId === article.id && (
                  <div className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {article.content}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact and Chat Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact form */}
        <div id="contact-form" className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Contact Support</h2>
          <p className="text-sm text-neutral-500">Send us a message and we'll get back to you.</p>
          <form className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              >
                <option value="">Select category</option>
                {supportCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </div>

        {/* Inline Live Chat */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Live Chat</h2>
          <p className="text-sm text-neutral-500">Chat with our support team in real-time.</p>
          <div className="mt-4 h-[400px]">
            <SupportChatPanel />
          </div>
        </div>
      </div>

      {/* Existing tickets */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Support Requests</h2>
        <p className="text-sm text-neutral-500">Your recent tickets</p>
        <div className="mt-5 divide-y divide-neutral-200 dark:divide-neutral-800">
          {mockSupportTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{ticket.subject}</p>
                <p className="text-xs text-neutral-500">{ticket.category} · {ticket.date}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
                  ticket.status === "Open"
                    ? "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800"
                    : "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800"
                )}
              >
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}