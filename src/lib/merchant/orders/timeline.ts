import type {
  OrderEvent,
  OrderEventActor,
  OrderEventType,
  OrderTimelineItem,
} from "./types";
import { ORDER_EVENT_LABELS } from "./labels";

const TONE_MAP: Record<
  OrderEventType,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  placed: "info",
  payment_confirmed: "success",
  payment_failed: "danger",
  status_changed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "warning",
  refunded: "warning",
  note_added: "neutral",
};

export function eventTone(
  type: OrderEventType
): "neutral" | "info" | "success" | "warning" | "danger" {
  return TONE_MAP[type];
}

export function eventTitle(event: OrderEvent): string {
  return ORDER_EVENT_LABELS[event.type];
}

export function formatEventTimestamp(ms: number): string {
  const d = new Date(ms);
  const date = d.toLocaleDateString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return date + " " + time;
}

export function actorInitials(actor: OrderEventActor | undefined): string {
  if (!actor) return "S";
  const source = (actor.name || actor.email || "").trim();
  if (source.length === 0) return "S";
  const parts = source.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (
    parts[0].slice(0, 1).toUpperCase() +
    parts[parts.length - 1].slice(0, 1).toUpperCase()
  );
}

export function projectTimeline(events: OrderEvent[]): OrderTimelineItem[] {
  if (!Array.isArray(events)) return [];
  const rows: OrderTimelineItem[] = events.map((e) => ({
    id: e.id,
    type: e.type,
    description: e.description,
    actorName: e.actor?.name ?? "System",
    createdAt: e.createdAt,
    tone: eventTone(e.type),
  }));
  rows.sort((a, b) => b.createdAt - a.createdAt);
  return rows;
}

export function buildPlacedEvent(
  actor: OrderEventActor,
  nowMs: number
): OrderEvent {
  return {
    id: crypto.randomUUID(),
    type: "placed",
    description: "Order placed by customer.",
    actor,
    createdAt: nowMs,
    toStatus: "new",
  };
}

export function buildStatusChangedEvent(
  from: OrderEvent["toStatus"],
  to: NonNullable<OrderEvent["toStatus"]>,
  actor: OrderEventActor,
  description: string,
  nowMs: number
): OrderEvent {
  return {
    id: crypto.randomUUID(),
    type: "status_changed",
    description,
    actor,
    createdAt: nowMs,
    fromStatus: from,
    toStatus: to,
  };
}