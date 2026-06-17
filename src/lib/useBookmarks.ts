"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useBookmarks() {
  const { status } = useSession();
  const router = useRouter();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (status !== "authenticated") { setIds(new Set()); return; }
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((arr: number[]) => setIds(new Set(arr)))
      .catch(() => {});
  }, [status]);

  const toggle = async (postId: number) => {
    if (status !== "authenticated") {
      alert("로그인이 필요한 기능이에요.");
      router.push("/login");
      return;
    }

    const had = ids.has(postId);
    const next = new Set(ids);
    had ? next.delete(postId) : next.add(postId);
    setIds(next);

    await fetch(`/api/bookmarks/${postId}`, {
      method: had ? "DELETE" : "POST",
    }).catch(() => {});
  };

  return {
    isBookmarked: (id: number) => ids.has(id),
    toggle,
  };
}
