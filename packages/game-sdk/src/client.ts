/**
 * Phía GAME (bundle chạy trong iframe/WebView). Game import cái này để nói
 * chuyện với host mà không cần biết chi tiết postMessage.
 *
 *   const host = await connectToHost("typing-basic");
 *   const items = await host.getContent({ subject: "toan", limit: 10 });
 *   host.reportResult({ ... });
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

export interface HostConnection {
  user: UserProfileLite;
  getContent: (query: ContentQuery) => Promise<ContentItem[]>;
  reportProgress: (p: GameProgress) => void;
  reportResult: (r: GameResult) => void;
  fireflyEvent: (e: FireflyEvent) => void;
  haptic: (style: "light" | "medium" | "success") => void;
  close: () => void;
}

function post(msg: GameToHost) {
  parent.postMessage(msg, "*");
}

export function connectToHost(gameId: string): Promise<HostConnection> {
  return new Promise((resolve) => {
    const pending = new Map<string, (items: ContentItem[]) => void>();
    let reqSeq = 0;

    window.addEventListener("message", (ev: MessageEvent) => {
      const msg = ev.data as HostToGame;
      if (msg.type === "init") {
        resolve({
          user: msg.user,
          getContent: (query) =>
            new Promise((res) => {
              const requestId = `r${reqSeq++}`;
              pending.set(requestId, res);
              post({ type: "requestContent", requestId, query });
            }),
          reportProgress: (p) => post({ type: "progress", payload: p }),
          reportResult: (r) => post({ type: "result", payload: r }),
          fireflyEvent: (e: FireflyEvent) =>
            post({ type: "firefly", payload: e }),
          haptic: (style) => post({ type: "haptic", style }),
          close: () => post({ type: "close" }),
        });
      } else if (msg.type === "content") {
        pending.get(msg.requestId)?.(msg.items);
        pending.delete(msg.requestId);
      }
    });

    post({ type: "ready", gameId });
  });
}
