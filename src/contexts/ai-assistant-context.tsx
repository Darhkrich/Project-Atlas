"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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

const AiAssistantContext = createContext<AiAssistantContextType | undefined>(undefined);

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "assistant",
      text: "Hello! I'm your Atlas assistant. Ask me anything about managing your store.",
    },
  ]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      from: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate assistant response with contextual help
    setTimeout(() => {
      const response = generateAssistantResponse(text);
      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, from: "assistant", text: response }]);
    }, 800);
  };

  return (
    <AiAssistantContext.Provider value={{ isOpen, setIsOpen, messages, sendMessage }}>
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const context = useContext(AiAssistantContext);
  if (!context) throw new Error("useAiAssistant must be used within AiAssistantProvider");
  return context;
}

function generateAssistantResponse(userInput: string): string {
  const input = userInput.toLowerCase();

  if (input.includes("product") && (input.includes("add") || input.includes("create"))) {
    return "To add a product, go to Products → Add Product. Fill in the name, description, price, and upload an image. The system will auto-generate an SKU.";
  }
  if (input.includes("order") && (input.includes("status") || input.includes("update"))) {
    return "You can update an order status from Orders page. Click on an order, then use the 'Update Order Status' dropdown.";
  }
  if (input.includes("domain") || input.includes("url")) {
    return "You can set your store URL, custom domain, or subdomain in Storefront → Settings → Domain Settings.";
  }
  if (input.includes("theme") || input.includes("appearance")) {
    return "You can change your store's appearance in Storefront → Appearance. Choose a theme and adjust colors.";
  }
  if (input.includes("refund")) {
    return "You can refund an order from Orders page. Open the order, then click 'Refund' and provide a reason.";
  }
  if (input.includes("payment") && input.includes("cod")) {
    return "Cash on Delivery can be enabled in Storefront → Settings. This lets customers pay upon delivery.";
  }
  if (input.includes("plan") || input.includes("subscription")) {
    return "You can view or change your subscription plan in Billing & Plan. Upgrading unlocks more themes and payment methods.";
  }
  if (input.includes("customer") || input.includes("report")) {
    return "In Customers page, you can view customer details, email, call, or report a customer.";
  }

  return "I'm here to help! You can ask about adding products, orders, domains, themes, refunds, or subscriptions.";
}