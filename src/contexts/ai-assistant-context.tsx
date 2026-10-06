"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Message = {
  id: string;
  from: "user" | "assistant";
  text: string;
};

interface AiAssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  sendMessage: (text: string) => void;
}

const AiAssistantContext = createContext<AiAssistantContextType | undefined>(
  undefined
);

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      from: "assistant",
      text: "Hello. I am your Atlas assistant. Ask me anything about managing your store.",
    },
  ]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      from: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);

    window.setTimeout(() => {
      const response = generateAssistantResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "assistant",
          text: response,
        },
      ]);
    }, 800);
  };

  return (
    <AiAssistantContext.Provider
      value={{ isOpen, setIsOpen, messages, sendMessage }}
    >
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const context = useContext(AiAssistantContext);
  if (!context) {
    throw new Error(
      "useAiAssistant must be used within AiAssistantProvider"
    );
  }
  return context;
}

// Placeholder. Keyword matching only. Replace with a real assistant
// integration when the backend ships.
function generateAssistantResponse(userInput: string): string {
  const input = userInput.toLowerCase();

  if (input.includes("product") && (input.includes("add") || input.includes("create"))) {
    return "To add a product, go to Products then Add Product. Fill in the name, description, price, and upload an image.";
  }
  if (input.includes("order") && (input.includes("status") || input.includes("update"))) {
    return "You can update an order status from the Orders page. Open the order, then use the status control.";
  }
  if (input.includes("domain") || input.includes("url")) {
    return "You can set your store URL or custom domain in Storefront then Settings.";
  }
  if (input.includes("theme") || input.includes("appearance")) {
    return "You can change your store appearance in Storefront then Appearance. Choose a theme and adjust colors.";
  }
  if (input.includes("refund")) {
    return "You can refund an order from the Orders page. Open the order, then choose Refund.";
  }
  if (input.includes("payment") && input.includes("cod")) {
    return "Cash on Delivery can be enabled in Storefront then Settings.";
  }
  if (input.includes("plan") || input.includes("subscription")) {
    return "You can view or change your subscription plan in Billing.";
  }
  if (input.includes("customer") || input.includes("report")) {
    return "In the Customers page you can view customer details, email, call, or report a customer.";
  }

  return "I am here to help. You can ask about products, orders, domains, themes, refunds, or subscriptions.";
}