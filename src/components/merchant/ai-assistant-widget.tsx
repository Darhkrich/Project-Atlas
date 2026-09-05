/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRef, useState, useEffect } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useAiAssistant } from "@/contexts/ai-assistant-context";
import { useSubscription } from "@/contexts/subscription-context";
import { cn } from "@/lib/utils";

export function AiAssistantWidget() {
  const { isOpen, setIsOpen, messages, sendMessage } = useAiAssistant();
  const { currentPlan } = useSubscription();
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
      });
    }
  }, []);

  // Hide on Starter plan, but only after hooks
  if (currentPlan === "starter") {
    return null;
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newX = dragStart.current.startX + dx;
    const newY = dragStart.current.startY + dy;

    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    setPosition({
      x: Math.min(Math.max(0, newX), maxX),
      y: Math.min(Math.max(0, newY), maxY),
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      {/* Floating draggable button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          left: position.x,
          top: position.y,
        }}
        className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-all ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        aria-label="AI Assistant"
      >
        <AtlasIcon name={isOpen ? "x-circle" : "message-circle"} className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed z-50 w-80 sm:w-96 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          style={{
            left: Math.max(0, Math.min(position.x - 260, window.innerWidth - 320)),
            top: Math.max(0, position.y - 350),
          }}
        >
          <div className="flex items-center justify-between rounded-t-xl bg-brand-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <AtlasIcon name="message-circle" className="h-5 w-5 text-white" />
              <div>
                <p className="text-sm font-semibold text-white">Atlas Assistant</p>
                <p className="text-xs text-white/70">Contextual help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <AtlasIcon name="x-circle" className="h-5 w-5" />
            </button>
          </div>

          {/* Messages with hidden scrollbar */}
          <div className="h-80 space-y-4 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.from === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    msg.from === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
              <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-700">
                <AtlasIcon name="send" className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}