/**
 * Phía HOST (shell). Gắn vào một <iframe> (web) hoặc WebView (mobile dùng cùng
 * giao thức) và nối các callback nghiệp vụ.
 */
import type {
  ContentItem,
  ContentQuery,
  FireflyEvent,
  GameProgress,
  GameResult,
  GameToHost,
  HostToGame,
  UserProfileLite,
} from "./protocol.js";

export interface HostHandlers {
  user: UserProfileLite;
  getContent: (query: ContentQuery) => Promise<ContentItem[]>;
  onProgress?: (p: GameProgress) => void;
  onResult: (r: GameResult) => void;
  onFirefly?: (e: FireflyEvent) => void;
  onHaptic?: (style: "light" | "medium" | "success") => void;
  onClose?: () => void;
}

/** Một đầu gửi message (iframe.contentWindow.postMessage hoặc bridge mobile). */
export interface MessagePort {
  post: (msg: HostToGame) => void;
  onMessage: (handler: (msg: GameToHost) => void) => () => void;
}

/** Tạo cổng giao tiếp cho iframe trên web. */
export function iframePort(
  iframe: HTMLIFrameElement,
  origin: string
): MessagePort {
  return {
    post: (msg) => iframe.contentWindow?.postMessage(msg, origin),
    onMessage: (handler) => {
      const listener = (ev: MessageEvent) => {
        if (ev.source !== iframe.contentWindow) return;
        handler(ev.data as GameToHost);
      };
      window.addEventListener("message", listener);
      return () => window.removeEventListener("message", listener);
    },
  };
}

/** Nối host với một game đang chạy trên `port`. Trả về hàm huỷ. */
export function attachHost(port: MessagePort, h: HostHandlers): () => void {
  return port.onMessage(async (msg) => {
    switch (msg.type) {
      case "ready":
        port.post({ type: "init", user: h.user, locale: "vi" });
        break;
      case "requestContent": {
        const items = await h.getContent(msg.query);
        port.post({ type: "content", requestId: msg.requestId, items });
        break;
      }
      case "progress":
        h.onProgress?.(msg.payload);
        break;
      case "result":
        h.onResult(msg.payload);
        break;
      case "firefly":
        h.onFirefly?.(msg.payload);
        break;
      case "haptic":
        h.onHaptic?.(msg.style);
        break;
      case "close":
        h.onClose?.();
        break;
    }
  });
}
