"use client"

import { useState } from "react";
import { acceptJoinRequest, rejectJoinRequest } from "@/server/actions/join-requests";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; 
import { Check, X, Loader2 } from "lucide-react"; // Optionnel : installe lucide-react

interface RequestActionsProps {
  requestId: string;
  paymentStatus: string;
  playerName: string;
}

// Définition d'un type pour nos retours d'actions
type ActionResult = { success: boolean; error?: string } | { error: string };

export default function RequestActions({ requestId, paymentStatus, playerName }: RequestActionsProps) {
  const [status, setStatus] = useState<"idle" | "accepting" | "rejecting">("idle");
  const router = useRouter();

  const isLoading = status !== "idle";

  async function handleAction(
    action: (id: string) => Promise<any>, 
    type: "accepting" | "rejecting"
  ) {
    // Confirmation spécifique pour l'acceptation si non payé
    if (type === "accepting" && paymentStatus !== "PAID" && paymentStatus !== "NOT_REQUIRED" && paymentStatus !== "PENDING") {
      const confirmText = `⚠️ Le paiement de ${playerName} n'est pas confirmé.\nAccepter quand même ?`;
      if (!window.confirm(confirmText)) return;
    }

    // Confirmation pour le refus
    if (type === "rejecting") {
      if (!window.confirm(`Refuser la demande de ${playerName} ?`)) return;
    }

    setStatus(type);
    const loadingToast = toast.loading(type === "accepting" ? "Acceptation..." : "Refus...");

    try {
      const result = await action(requestId);
      
      if (result && "error" in result) {
        toast.error(result.error, { id: loadingToast });
      } else {
        toast.success(type === "accepting" ? "Joueur accepté !" : "Demande refusée", { id: loadingToast });
        router.refresh();
      }
    } catch (err) {
      toast.error("Une erreur inattendue est survenue.", { id: loadingToast });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => handleAction(acceptJoinRequest, "accepting")}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {status === "accepting" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Accepter
      </button>

      <button
        onClick={() => handleAction(rejectJoinRequest, "rejecting")}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {status === "rejecting" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
        Refuser
      </button>
    </div>
  );
}