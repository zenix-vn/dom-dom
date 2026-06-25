"use client";

import { useEffect, useRef } from "react";
import {
  attachHost,
  iframePort,
  type HostHandlers,
} from "@domdom/game-sdk/host";
import type { ContentItem } from "@domdom/game-sdk";
import { createClient } from "@/lib/supabase/client";

interface Props {
  entry: string; // URL bundle game
  user: HostHandlers["user"];
}

/** Nạp một game plugin trong iframe sandbox và nối Game SDK. */
export function GameFrame({ entry, user }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    const supabase = createClient();
    const port = iframePort(iframe, window.location.origin);
    const detach = attachHost(port, {
      user,
      async getContent(query): Promise<ContentItem[]> {
        let q = supabase
          .from("questions")
          .select("id, stem, choices, answer, explanation")
          .limit(query.limit ?? 10);
        if (query.lessonId) q = q.eq("lesson_id", query.lessonId);
        const { data } = await q;
        return (data ?? []) as unknown as ContentItem[];
      },
      onResult(result) {
        // Gửi lên Edge Function để chấm lại & ghi điểm (chống gian lận).
        void supabase.functions.invoke("submit-score", { body: result });
      },
      onFirefly(e) {
        console.debug("firefly", e); // TODO: cập nhật mascot trên shell
      },
    });

    return detach;
  }, [user]);

  return (
    <iframe
      ref={ref}
      src={entry}
      sandbox="allow-scripts allow-same-origin"
      style={{ width: "100%", height: "100%", border: "none" }}
      title="Đom Đóm game"
    />
  );
}
