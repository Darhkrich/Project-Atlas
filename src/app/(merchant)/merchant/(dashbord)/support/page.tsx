"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export default function MerchantSupportPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  // Live chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 How can we help you today?",
      from: "support",
      time: "10:00 AM",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: chatInput,
      from: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    // Simulate support response
    setTimeout(() => {
      const supportReply = {
        id: Date.now() + 1,
        text: "Thanks for your message! A support agent will be with you shortly.",
        from: "support",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, supportReply]);
    }, 1500);
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Contact Support
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Send us a message and we&apos;ll get back to you within 24 hours.
            </p>
            <form className="mt-4 space-y-4">
              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500"
                />
              </div>
              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  <option value="">Select category</option>
                  {supportCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Existing tickets */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Support Requests
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {mockSupportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-2"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {ticket.category} · {ticket.date}
                    </p>
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

        {/* Right column */}
        <div className="space-y-6">
          {/* Help articles */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Help Articles
            </h2>
            <div className="mt-4 space-y-3">
              {[
                "How to add a product",
                "How to customize your store",
                "How to process orders",
                "How to manage customers",
                "How to change your subscription",
              ].map((article) => (
                <Link
                  key={article}
                  href="#"
                  className="flex items-center gap-3 text-sm text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-200 transition-colors"
                >
                  <AtlasIcon name="file-text" className="h-4 w-4 text-neutral-400" />
                  {article}
                </Link>
              ))}
            </div>
          </div>

          {/* Live chat card */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Live Chat
              </h2>
            </div>
            <div className="p-5">
              {!chatOpen ? (
                <div className="text-center">
                  <p className="text-sm text-neutral-500">
                    Chat with our support team in real-time.
                  </p>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    <AtlasIcon name="message-circle" className="h-5 w-5" />
                    Start Chat
                  </button>
                </div>
              ) : (
                <div>
                  {/* Chat messages */}
                  <div className="h-64 overflow-y-auto space-y-3 p-2">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.from === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                            msg.from === "user"
                              ? "bg-brand-600 text-white"
                              : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                          )}
                        >
                          <p>{msg.text}</p>
                          <p className={cn("mt-1 text-xs", msg.from === "user" ? "text-white/70" : "text-neutral-500")}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Chat input */}
                  <form onSubmit={sendChatMessage} className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-700"
                    >
                      <AtlasIcon name="send" className="h-5 w-5" />
                    </button>
                  </form>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="mt-2 text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Close chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}