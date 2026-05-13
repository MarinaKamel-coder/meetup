// src/components/RequestActions.tsx
"use client"

import { useState } from "react";
import { acceptJoinRequest, rejectJoinRequest } from "@/server/actions/join-requests";
import { useRouter } from "next/navigation";

export default function RequestActions({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAccept() {
    setIsLoading(true);
    await acceptJoinRequest(requestId);
    router.refresh();
    setIsLoading(false);
  }

  async function handleReject() {
    setIsLoading(true);
    await rejectJoinRequest(requestId);
    router.refresh();
    setIsLoading(false);
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={handleAccept}
        disabled={isLoading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        ✓ Accepter
      </button>
      <button
        onClick={handleReject}
        disabled={isLoading}
        className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
      >
        ✗ Refuser
      </button>
    </div>
  );
}