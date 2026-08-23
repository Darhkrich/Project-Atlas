"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

type SupportArticle = {
  question: string;
  answer: string;
};

type SupportCategory = {
  id: string;
  title: string;
  description: string;
  icon: AtlasIconName;
  articles: SupportArticle[];
};

const supportCategories: SupportCategory[] = [
  {
    id: "account",
    title: "Account & Profile",
    description: "Manage your account, password, profile and security.",
    icon: "user",
    articles: [
      {
        question: "How to update your account information",
        answer:
          "Go to Settings > Profile. From there you can update your name, email address, phone number, and other personal details. Changes take effect immediately.",
      },
      {
        question: "How to change your password",
        answer:
          "Go to Settings > Security > Change Password. Enter your current password, then choose a new strong password. You’ll receive a confirmation once it’s updated.",
      },
      {
        question: "How to enable account security",
        answer:
          "You can enable two-factor authentication from Settings > Security. This adds an extra layer of protection to your Atlas account.",
      },
      {
        question: "How to delete your account",
        answer:
          "To delete your account, contact our support team through the chat or the contact form. We’ll guide you through the verification and deletion process.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Wallet",
    description: "Wallet funding, payment methods, charges and payment issues.",
    icon: "wallet",
    articles: [
      {
        question: "How to fund your Atlas wallet",
        answer:
          "Go to Wallet > Fund Wallet. Select a payment method (Mobile Money, Card, Bank Transfer, USSD), enter the amount, and confirm the transaction.",
      },
      {
        question: "How to add a payment method",
        answer:
          "During checkout or wallet funding, choose your preferred method and enter the required details. You can save the method for future transactions from the payment confirmation step.",
      },
      {
        question: "What to do if a payment fails",
        answer:
          "First check your transaction history for the status. If the amount was deducted but the service not delivered, contact support with your transaction ID for resolution.",
      },
      {
        question: "How to withdraw funds",
        answer:
          "Go to Wallet > Withdraw. Select bank transfer or mobile money, enter your details and the amount, then confirm. Withdrawals are processed within the stated timeframe.",
      },
    ],
  },
  {
    id: "services",
    title: "Services & Orders",
    description: "Airtime, data, electricity, TV and other services.",
    icon: "grid",
    articles: [
      {
        question: "How to buy a data bundle",
        answer:
          "Go to Services > Data. Select your network, choose a data plan, enter the recipient number, then proceed to payment.",
      },
      {
        question: "How to purchase airtime",
        answer:
          "Go to Services > Airtime. Choose your network, select an amount or enter a custom amount, provide the recipient number, and complete payment.",
      },
      {
        question: "How to pay electricity bills",
        answer:
          "Go to Services > Electricity. Enter your meter number, select meter type, choose an amount, and confirm. Your token will be sent after successful payment.",
      },
      {
        question: "How to subscribe to TV",
        answer:
          "Go to Services > Cable TV. Select your provider, enter your smartcard/decoder number, choose a package, and complete payment.",
      },
    ],
  },
  {
    id: "transactions",
    title: "Transactions",
    description: "Track purchases, transaction status and order history.",
    icon: "receipt",
    articles: [
      {
        question: "How to view transaction history",
        answer:
          "Go to Transactions from the dashboard. You can filter by status, date range, and search using service names or transaction IDs.",
      },
      {
        question: "Understanding transaction statuses",
        answer:
          "Successful means completed. Pending means still processing. Failed means the transaction did not go through. You can click any transaction for more details.",
      },
      {
        question: "What to do if a transaction is pending",
        answer:
          "If a transaction remains pending for more than a few minutes, wait a little longer, then check again. If it stays pending, contact support with your transaction ID.",
      },
    ],
  },
  {
    id: "ecommerce",
    title: "E-commerce & Store Owner",
    description: "Help with your white-label online store and selling online.",
    icon: "bag",
    articles: [
      {
        question: "How to set up your e-commerce store",
        answer:
          "Go to the E-commerce section, choose a template, customize your branding, add products, and publish. No coding is required.",
      },
      {
        question: "How to add products",
        answer:
          "In your store dashboard, go to Products > Add Product. Upload images, set price, description, and stock. Save to publish.",
      },
      {
        question: "How to manage orders",
        answer:
          "Open Orders in your store dashboard to view all orders. You can update status, fulfill, or contact customers from there.",
      },
      {
        question: "How to customize your store",
        answer:
          "Use the store builder to change colors, logo, layout, and pages. Changes are saved automatically and can be previewed before publishing.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Find solutions to common service and transaction problems.",
    icon: "settings",
    articles: [
      {
        question: "My service was not delivered",
        answer:
          "Check the transaction status first. If it shows successful but service not received, wait a few minutes. If still not delivered, contact support with your transaction ID.",
      },
      {
        question: "My payment was successful but order failed",
        answer:
          "If payment succeeded but order failed, your money is safe. Contact support with the transaction ID, and we’ll resolve it.",
      },
      {
        question: "How to contact support",
        answer:
          "Use the chat widget on this page or go to Contact. You can also email support@atlas.com. Our team is available to help.",
      },
    ],
  },
];

type ChatMessage = {
  id: string;
  sender: "user" | "support";
  text: string;
  time: string;
};

export function SupportContent() {
  const [activeCategory, setActiveCategory] = useState<string>("account");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<SupportArticle | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "support",
      text: "Welcome to Atlas Support! How can we help you today?",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedCategory = supportCategories.find((c) => c.id === activeCategory);

  const filteredArticles = selectedCategory
    ? selectedCategory.articles.filter((article) =>
        article.question.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatOpen]);

  const getSupportReply = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("fund") || lower.includes("wallet") || lower.includes("payment")) {
      return "To fund your wallet, go to Wallet > Fund Wallet and choose a payment method. Would you like help with a specific payment issue?";
    }
    if (lower.includes("data") || lower.includes("airtime")) {
      return "You can buy data or airtime from the Services page. Would you like a step-by-step guide?";
    }
    if (lower.includes("pending") || lower.includes("failed") || lower.includes("transaction")) {
      return "Please check your transaction history for status updates. If a transaction remains pending, contact support with the transaction ID.";
    }
    if (lower.includes("store") || lower.includes("ecommerce") || lower.includes("product")) {
      return "For e-commerce support, you can manage your store from the E-commerce section. Need help with products or orders?";
    }
    if (lower.includes("account") || lower.includes("password") || lower.includes("profile")) {
      return "You can update your account details from Settings. If you forgot your password, use the reset option on login.";
    }
    return "Thank you for your message. Our support team will get back to you shortly. Is there anything else we can help with?";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
      time: "Just now",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const supportReply: ChatMessage = {
        id: `support-${Date.now()}`,
        sender: "support",
        text: getSupportReply(input),
        time: "Just now",
      };
      setMessages((prev) => [...prev, supportReply]);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <AtlasIcon
          name="search"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search help articles..."
          className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-12 pr-4 text-base text-neutral-900 placeholder-neutral-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
        />
      </div>

      {/* Support Categories Grid */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Quick Support Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supportCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setSearchQuery("");
              }}
              className={`group rounded-xl border p-5 text-left transition-shadow hover:shadow-md ${
                activeCategory === category.id
                  ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                <AtlasIcon name={category.icon} className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {category.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {category.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Help Topics for Selected Category */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {selectedCategory?.title} — Help Topics
        </h2>
        <AtlasCard padding="none">
          {filteredArticles.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredArticles.map((article) => (
                <li key={article.question}>
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {article.question}
                    </span>
                    <AtlasIcon
                      name="arrow-right"
                      className="h-4 w-4 text-neutral-400"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
              No articles found.
            </p>
          )}
        </AtlasCard>
      </section>

      {/* Transaction Problem CTA */}
      <section>
        <div className="rounded-xl bg-brand-900 p-6 text-white dark:bg-brand-950">
          <h3 className="text-lg font-semibold">Having a problem with a transaction?</h3>
          <p className="mt-1 text-sm text-brand-200">
            Check your transaction status or contact support if your service has not been delivered.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/customer/transactions"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
            >
              View My Transactions
            </Link>
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Chat with Support
            </button>
          </div>
        </div>
      </section>

      {/* Article Answer Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setSelectedArticle(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-t-xl bg-white p-6 shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {selectedArticle.question}
              </h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">
              {selectedArticle.answer}
            </p>
            <div className="mt-6">
              <Button className="w-full" onClick={() => setSelectedArticle(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat / Messaging System */}
      {chatOpen && (
        <div className="fixed bottom-0 right-0 z-50 flex w-full sm:bottom-6 sm:right-6 sm:w-96">
          <div className="flex h-[500px] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl dark:bg-neutral-900 sm:rounded-xl">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Atlas Support
                </h3>
                <p className="text-xs text-success-600 dark:text-success-400">
                  Online
                </p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close chat"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                        message.sender === "user"
                          ? "bg-brand-800 text-white"
                          : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p
                        className={`mt-1 text-xs ${
                          message.sender === "user"
                            ? "text-brand-200"
                            : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
                />
                <Button onClick={handleSend} size="sm" className="shrink-0">
                  <AtlasIcon name="send" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}