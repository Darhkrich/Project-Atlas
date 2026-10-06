/* eslint-disable react-hooks/refs */
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useStoreProducts } from "@/contexts/store-products-context";
import { getStarterCatalog as getStaticProducts } from "@/lib/merchant/products/starter-catalog";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

const DESKTOP_VIEWPORT_WIDTH = 1280;
const DESKTOP_VIEWPORT_HEIGHT = 800;
const DESKTOP_PREVIEW_HEIGHT = 640;

const MOBILE_VIEWPORT_WIDTH = 390;
const MOBILE_PHONE_WIDTH = 320;
const MOBILE_PHONE_SCREEN_HEIGHT = 680;
const MOBILE_SCREEN_RADIUS = 36;
const MOBILE_BEZEL = 10;

const PREVIEW_ROUTE = "/merchant/preview-store";
const MESSAGE_TYPE = "atlas:storefront-preview";
const READY_TYPE = "atlas:storefront-preview-ready";
const POST_DEBOUNCE_MS = 400;

interface MerchantStorefrontPreviewProps {
  store: MerchantStorefrontConfig;
  mode?: "desktop" | "mobile";
  interactive?: boolean;
}

interface PreviewPayload {
  store: MerchantStorefrontConfig;
  products: ReturnType<typeof getStaticProducts>;
}

export function MerchantStorefrontPreview({
  store,
  mode = "desktop",
  interactive = false,
}: MerchantStorefrontPreviewProps) {
  const { getProductsForStore } = useStoreProducts();
  let products = getProductsForStore(store.slug);
  if (products.length === 0) {
    products = getStaticProducts(store.templateCategory);
  }

  const payload: PreviewPayload = { store, products };

  return mode === "desktop" ? (
    <DesktopPreview payload={payload} interactive={interactive} />
  ) : (
    <MobilePreview payload={payload} interactive={interactive} />
  );
}

function usePostConfig(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  payload: PreviewPayload
) {
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const signature = useMemo(
    () => JSON.stringify(payload.store),
    [payload.store]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let timer: number | null = null;

    const send = () => {
      const win = iframe.contentWindow;
      if (!win) return;
      win.postMessage(
        { type: MESSAGE_TYPE, payload: payloadRef.current },
        window.location.origin
      );
    };

    const scheduleSend = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        send();
        timer = null;
      }, POST_DEBOUNCE_MS);
    };

    const onLoad = () => {
      scheduleSend();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string };
      if (data?.type === READY_TYPE) {
        scheduleSend();
      }
    };

    iframe.addEventListener("load", onLoad);
    window.addEventListener("message", onMessage);
    scheduleSend();

    return () => {
      iframe.removeEventListener("load", onLoad);
      window.removeEventListener("message", onMessage);
      if (timer) window.clearTimeout(timer);
    };
  }, [iframeRef, signature]);
}

function DesktopPreview({
  payload,
  interactive,
}: {
  payload: PreviewPayload;
  interactive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  usePostConfig(iframeRef, payload);

  const scale = width > 0 ? width / DESKTOP_VIEWPORT_WIDTH : 0;
  const iframeHeight =
    scale > 0
      ? Math.ceil(DESKTOP_PREVIEW_HEIGHT / scale)
      : DESKTOP_VIEWPORT_HEIGHT;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800">
      <div className="flex h-8 items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-3 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-white"
        style={{ height: DESKTOP_PREVIEW_HEIGHT }}
      >
        <iframe
          ref={iframeRef}
          src={PREVIEW_ROUTE}
          title="Storefront preview, desktop"
          scrolling="no"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: DESKTOP_VIEWPORT_WIDTH,
            height: iframeHeight,
            border: 0,
            transform: "scale(" + scale + ")",
            transformOrigin: "top left",
            pointerEvents: interactive ? "auto" : "none",
            visibility: scale > 0 ? "visible" : "hidden",
          }}
        />
      </div>
    </div>
  );
}

function MobilePreview({
  payload,
  interactive,
}: {
  payload: PreviewPayload;
  interactive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  usePostConfig(iframeRef, payload);

  const maxPhoneWidth = MOBILE_PHONE_WIDTH + MOBILE_BEZEL * 2;
  const phoneTotalWidth =
    containerWidth > 0
      ? Math.min(maxPhoneWidth, containerWidth)
      : maxPhoneWidth;
  const screenWidth = Math.max(phoneTotalWidth - MOBILE_BEZEL * 2, 0);
  const scale =
    containerWidth > 0 && screenWidth > 0
      ? screenWidth / MOBILE_VIEWPORT_WIDTH
      : 0;
  const iframeHeight =
    scale > 0
      ? Math.ceil(MOBILE_PHONE_SCREEN_HEIGHT / scale)
      : MOBILE_PHONE_SCREEN_HEIGHT;

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      <div
        className="bg-neutral-900 shadow-2xl"
        style={{
          padding: MOBILE_BEZEL,
          width: phoneTotalWidth,
          borderRadius: MOBILE_SCREEN_RADIUS + MOBILE_BEZEL,
          overflow: "hidden",
          visibility: scale > 0 ? "visible" : "hidden",
        }}
      >
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: screenWidth > 0 ? screenWidth : MOBILE_PHONE_WIDTH,
            height: MOBILE_PHONE_SCREEN_HEIGHT,
            borderRadius: MOBILE_SCREEN_RADIUS,
          }}
        >
          <iframe
            ref={iframeRef}
            src={PREVIEW_ROUTE}
            title="Storefront preview, mobile"
            scrolling="no"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: MOBILE_VIEWPORT_WIDTH,
              height: iframeHeight,
              border: 0,
              transform: "scale(" + scale + ")",
              transformOrigin: "top left",
              pointerEvents: interactive ? "auto" : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}