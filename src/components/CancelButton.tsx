// src/components/CancelButton.tsx
"use client"

import { useState } from "react";
import { cancelJoinRequest } from "@/server/actions/join-requests";
import { useRouter } from "next/navigation";

export default function CancelButton({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    setIsLoading(true);
    await cancelJoinRequest(requestId);
    router.refresh();
    setIsLoading(false);
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isLoading}
      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {isLoading ? "Annulation..." : "Annuler la demande"}
    </button>
  );
}