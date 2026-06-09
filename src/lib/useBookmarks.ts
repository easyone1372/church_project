"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const LS_KEY = "refill_bookmarks";

export function useBookmarks() {
  const { status } = useSession();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      fetch("/api/bookmarks")
        .then((r) => r.json())
        .then((arr: number[]) => setIds(new Set(arr)))
        .catch(() => {});
    } else {
      try {
        const arr: number[] = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
        setIds(new Set(arr));
      } catch {
        setIds(new Set());
      }
    }
  }, [status]);

  const toggle = async (postId: number) => {
    const had = ids.has(postId);
    const next = new Set(ids);
    had ? next.delete(postId) : next.add(postId);
    setIds(next);

    if (status !== "authenticated") {
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      return;
    }

    await fetch(`/api/bookmarks/${postId}`, {
      method: had ? "DELETE" : "POST",
    }).catch(() => {});
  };

  return {
    isBookmarked: (id: number) => ids.has(id),
    toggle,
  };
}
